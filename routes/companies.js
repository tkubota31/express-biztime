const express = require("express");
const router = new express.Router();
const db = require("../db")
const ExpressError = require("../expressError")


//Return list of companies
router.get("/", async(req,res,next) =>{
    try{
        const results = await db.query(`SELECT code,name FROM companies`);
        return res.json({"companies": results.rows})
    } catch (e){
        return next(e);
    }
})

router.get("/:code", async(req,res,next) =>{
    try{
        const code = req.params.code
        const results = await db.query(`SELECT * FROM companies WHERE code = $1`,[code])
        console.log(results);
        const invoiceResults = await db.query(
            `SELECT id
             FROM invoices
             WHERE comp_code = $1`,
          [code]
      );
        if(results.rows.length() ===0){
            throw new ExpressError("Not found", 404)
        }
        compData = results.rows[0];
        invData = invoiceResults.rows[0];
        return res.json({"company": {code: compData.code, name: compData.name, description: compData.description, invoices:invData}});

    } catch(e){
        return next(e)
    }
})

router.post("/", async(req,res,next) =>{
    try{
        const {code, name, description} = req.body;
        const results = await db.query(`INSERT INTO companies(code,name,description)
                                        VALUES ($1,$2,$3)
                                        RETURNING code,name,description`, [code,name,description]);

        return res.json({"company": results.rows})
    } catch(e){
        return next(e);
    }
})

router.put("/:code", async(req,res,next) =>{
    try{
        let {name,description} = req.body;
        let code = req.params.code;
        const results = await db.query (`UPDATE companies
                                        SET name = $1, description=$2 WHERE code=$3 RETURNING code,name,description`, [name,description,code])
        return res.json({"company": results.rows[0]})

    } catch(e){
    return next(e);
    }
});

router.delete("/:code", async(req,res,next) =>{
    try{
        let code = req.params.code
        const results= db.query(`DELETE FROM companies WHERE code =$1 RETURNING code`, [code]);

        if (results.rows.length == 0) {
            throw new ExpressError(`Company not found`, 404)
          } else {
            return res.json({"status": "deleted"});
          }

    } catch(e){
        return next(e);
    }
});

module.exports = router;
