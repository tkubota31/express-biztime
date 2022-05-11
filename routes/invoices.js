const express = require("express");
const res = require("express/lib/response");
const router = new express.Router();
const db = require("../db")
const ExpressError = require("../expressError")

router.get("/", async(req,res,next) =>{
    try{
        const results = await db.query(`SELECT id, comp_code FROM invoices`);
        return res.json({"invoices": results.rows})
    }catch(e){
        return next(e)
    }
});

router.get("/:id", async(req,res,next) => {
    try{
        const id = req.params.id;
        const results = await db.query(`SELECT
        i.id,
        i.comp_code,
        i.amt,
        i.paid,
        i.add_date,
        i.paid_date,
        c.name,
        c.description
        FROM invoices AS i
        INNER JOIN companies AS c ON (i.comp_code = c.code)
        WHERE id = $1`, [id]);

        if (results.rows.length === 0) {
            throw new ExpressError(`No such invoice: ${id}`,404);
          }

        const data = results.rows[0];

        return res.json({"invoice": {id:data.id, amt:data.amt, paid:data.paid, add_date: data.add_date, paid_date: data.paid_date, company: { code: data.comp_code, name: data.name, description: data.description}}})
    }catch(e){
        return next(e);
    }
});

router.post("/", async(req,res,next) =>{
    try{
    const{comp_code, amt} = req.body;
    const results = await db.query(`INSERT INTO invoices (comp_code,amt) VALUES ($1, $2) RETURNING id, comp_code,amt,paid,add-date,paid_date`, [comp_code, amt]);

    return res.json(results.rows[0])
    } catch(e){
        return next(e);
    }
})

router.put('/:id', async(req,res,next) =>{
    try{
    const id = req.params.id;
    let amt = req.body;

    const results = await db.query(`UPDATE invoices SET amt=$1 WHERE id = $2 RETURNING id,comp_code, amt,paid,add_date, paid_date`,[amt,id])
    if (results.rows.length == 0) {
        throw new ExpressError(`Company not found`, 404)
      } else {
        return res.json({"invoice": results.rows[0]});
      }
    }catch(e){
        return next(e);
    }
});

router.delete("/:id", async(req,res,next) =>{
    try {
        let id = req.params.id;

        const results = await db.query(
              `DELETE FROM invoices
               WHERE id = $1
               RETURNING id`,
            [id]);

        if (results.rows.length === 0) {
          throw new ExpressError(`Not found`, 404);
        }

        return res.json({"status": "deleted"});
      }

      catch (err) {
        return next(err);
      }
});


module.exports = router
