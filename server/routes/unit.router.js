const express = require("express");
const pool = require("../modules/pool");
const router = express.Router();
const {
  rejectUnauthenticated,
} = require("../modules/authentication-middleware");

const { rejectNonAdmin } = require("../modules/admin-middleware");

//GET all units
router.get("/", rejectUnauthenticated, async (req, res) => {
  try {
    const queryText = `
    SELECT * FROM "units"
    ORDER BY "unitOrder" ASC
    `;
    const unitResult = await pool.query(queryText);
    units = unitResult.rows;
    res.send(units);
  } catch (error) {
    res.sendStatus(500);
    console.log("Error getting unit:", error);
  }
});

//GET lessons and content from a specific unit
router.get("/:id", rejectUnauthenticated, async (req, res) => {
  try {
    const queryText = `
    SELECT 
        "units".id AS "unitId", 
        "units".name AS "unitName", 
        "units".subtitle AS "unitSubtitle", 
        "lessons".id AS "lessonId", 
        "lessons".name AS "lessonName", 
        "lessons".description AS "lessonDescription", 
        "lessonOrder",
        ARRAY_AGG("content".title ORDER BY "contentOrder" ASC) AS "contentTitle", 
        ARRAY_AGG("content".description ORDER BY "contentOrder" ASC) AS "contentDescription", 
        ARRAY_AGG("contentOrder" ORDER BY "contentOrder" ASC) AS "contentOrder", 
        ARRAY_AGG("content".id ORDER BY "contentOrder" ASC) AS "contentId",
        ARRAY_AGG("content"."isRequired" ORDER BY "contentOrder" ASC) AS "contentIsRequired"
    FROM "units"
    LEFT JOIN "lessons" ON "lessons".units_id = "units".id
    LEFT JOIN "content" ON "content".lessons_id = "lessons".id
    WHERE "units".id = $1
    GROUP BY 
        "units".id, 
        "units".name, 
        "units".subtitle, 
        "lessons".id, 
        "lessons".name, 
        "lessons".description, 
        "lessonOrder"
    ORDER BY "lessonOrder" ASC;
;`;

    const params = [req.params.id];
    const unitResult = await pool.query(queryText, params);
    units = unitResult.rows;
    res.send(units);
  } catch (error) {
    res.sendStatus(500);
    console.log("Error getting unit:", error);
  }
});

//POST new unit
router.post("/", rejectUnauthenticated, rejectNonAdmin, async (req, res) => {
  try {
    const queryText = `
    INSERT INTO "units" ("name", "subtitle")
    VALUES($1, $2)
    `;

    await pool.query(queryText, [
      req.body.name,
      req.body.subtitle
    ]);

    res.sendStatus(201);
  } catch (error) {
    res.sendStatus(500);
    console.log("Error posting unit :", error);
  }
});

router.put("/:id", rejectUnauthenticated, rejectNonAdmin, async (req, res) => {
  try {
    const queryText = `
    UPDATE "units"
    SET "name" = $1, "unitOrder" = $2, "subtitle" = $3
    WHERE "id" = $4
    `;

    await pool.query(queryText, [
      req.body.name,
      req.body.unitOrder,
      req.body.subtitle,
      req.params.id,
    ]);

    res.sendStatus(200);
  } catch (error) {
    console.log("Error editing unit :", error);
  }
});

// swaps units order
router.put("/", rejectUnauthenticated, rejectNonAdmin, async (req, res) => {
  try {
    const queryText = `
    UPDATE "units"
    SET "unitOrder" = $1
    WHERE "id" = $2
    `;

    const params = [ req.body.order, req.body.id ]

    await pool.query(queryText, params);

    res.sendStatus(200);
  } catch (error) {
    console.log("Error editing unit :", error);
  }
});

//DELETE new unit
router.delete(
  "/:id",
  rejectUnauthenticated,
  rejectNonAdmin,
  async (req, res) => {
    try {
      const query = `
      DELETE FROM "units"
      WHERE "units".id = $1;`;

      params = [req.params.id];

      await pool.query(query, params);
      res.sendStatus(200);
    } catch (error) {
      console.log("Error deleting unit :", error);
      res.sendStatus(500);
    }
  }
);

module.exports = router;
