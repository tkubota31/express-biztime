process.env.NODE_ENV = "test"
const request = require("supertest")
const app = require("../app")
const db = require("../db")

let testCompany;
let testInv;
beforeEach(async () =>{
    const result = db.query("INSERT INTO companies (code, name, description) VALUES ('apple', 'Apple', 'Apple is not bad'), ('ibm', 'IBM', 'don't know much about this one')");
    testCompany = result.rows[0];
    const inv = db.query(`INSERT INTO invoices (comp_code, amt, paid, add_date, paid_date) VALUES ('apple', 100, false, '2018-01-01', null)`)
    testInv = inv.rows[0];
});

afterAll(async () =>{
    await db.end()
})

describe ("GET /", () =>{
    test("Get list of companies", async () =>{
        const res = await request(app).get("/companies")
        expect(res.statusCode).toBe(200)
        expect(res.body).toEqual({"companies": [
            {code: "apple", name:"Apple"},
            {code: "ibm", name:"IBM"}
        ]})
    })
})

describe("GET /companies/:code", () =>{
    test("Get IBM info", async () =>{
        const res = await request(app).get(`/companies/${testCompany.code}`)
        expect(res.statusCode).toBe(200)
        expect(res.body).toEqual({"companies":
            {code:"apple",
             name:"Apple",
             description: "Apple is not bad",
             invoice: testInv}
        })
    })
    test("Return 404 for company not found", async function () {
        const res = await request(app).get("/companies/errorComp");
        expect(res.status).toEqual(404);
      })
});


describe ("POST /companies", () =>{
    test("Create new company", async () =>{
        const res = await request(app).post("/companies").send({ name:"Lucky", description:"Best dog"});
        expect(res.status.code).toBe(201);
        expect(res.body).toEqual({"company":{
            name:"Lucky",
            description:"Best dog"
        }
    });
    })
    test("404 for company not found", async function () {
        const res = await request(app)
            .put("/companies/errorComp")
            .send({name: "random words"});

        expect(res.status).toEqual(404);
      });
});

describe("PUT /companies/:code", () =>{
    test("Should update company", async () =>{
        const res = await request(app).put(`/companies/${testCompany.code}`).send({ name: "newApple", description:"This is a good apple"});
        expect(res.statusCode).toBe(201);
        expect(res.body).toEqual({
            "company":{
                code:"apple",
                name:"newApple",
                description:"This is a good apple"
            }
        })
    })
    test("404 for company not found", async function () {
        const res = await request(app)
            .put("/companies/errorcomp")
            .send({name: "random words"});

        expect(res.status).toEqual(404);
      });
})

describe("DELETE /companies/:code", ()=>{
    test("Delete a company", async ()=>{
        const res = await request(app).delete(`/companies/${testCompany.code}`)
        expect(response.body).toEqual({"status": "deleted"});
    })
    test("404 for company not found", async function () {
        const res = await request(app).delete("/companies/errorcomp");

        expect(res.status).toEqual(404);
      });
})
