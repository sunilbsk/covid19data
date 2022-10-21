const express = require("express");
const app = express();
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const dbPath = path.join(__dirname, "covid19India.db");
app.use(express.json());
let db = null;
const initializeDbaAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error:${e.message}`);
    process.exit(1);
  }
};
initializeDbaAndServer();

convertDbObjectToDbResponse = (dbObject) => {
  return {
    districtId: dbObject.district_id,
    districtName: dbObject.district_name,
    stateId: dbObject.state_id,
    stateName: dbObject.state_name,
    population: dbObject.population,
    districtName: dbObject.district_name,
    cases: dbObject.cases,
    cured: dbObject.cured,
    active: dbObject.active,
    deaths: dbObject.deaths,
  };
};
convertDbObjectToDbResponse1 = (dbObject) => {
  return {
    totalCases: dbObject.cases,
    totalCured: dbObject.cured,
    totalActive: dbObject.active,
    totalDeaths: dbObject.deaths,
  };
};

//API -1  /states/ -GET

app.get("/states/", async (request, response) => {
  const getStates = `
    SELECT 
     *
    FROM 
    state
    ORDER BY
     state_id;`;
  const stateArray = await db.all(getStates);
  response.send(
    stateArray.map((eachState) => convertDbObjectToDbResponse(eachState))
  );
});

// API-2  GET /states/:stateId
app.get("/states/:stateId/", async (request, response) => {
  const { stateId } = request.params;
  const getStates = `
    SELECT 
     *
    FROM 
    state
    WHERE 
     state_id ='${stateId}';`;
  const state = await db.get(getStates);
  response.send(convertDbObjectToDbResponse(state));
});
//API -3 ..POST /districts/

app.post("/districts/", async (request, response) => {
  const stateDetails = request.body;
  const { districtName, stateId, cases, cured, active, deaths } = stateDetails;
  const addCase = `
     INSERT INTO 
      district(district_name,state_id,cases,cured,active,deaths)
     VALUES (
        "${districtName}",
        "${stateId}",
        "${cases}",
        "${cured}",
        "${active}",
        "${deaths}");`;

  const dbResponse = await db.run(addCase);
  const districtId = dbResponse.lastID;
  //response.send(` districtId: ${districtId}`);
  response.send("District Successfully Added");
});

// API-4  GET /districts/:districtId/
app.get("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const getDistrict = `
    SELECT 
     *
    FROM 
    district
    WHERE 
     district_id ='${districtId}';`;
  const district = await db.get(getDistrict);
  response.send(convertDbObjectToDbResponse(district));
});

// API-5  DELETE /districts/:districtId/
app.delete("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const deleteDistrict = `
    DELETE FROM 
    district
    WHERE 
     district_id ='${districtId}';`;
  const district = await db.run(deleteDistrict);
  response.send("District Removed");
});
// API-6 PUT /districts/:districtId/

app.put("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const districtDetails = request.body;
  const {
    districtName,
    stateId,
    cases,
    cured,
    active,
    deaths,
  } = districtDetails;

  const updateData = `
    UPDATE 
    district
    SET 
     district_name ="${districtName}",
     state_id ="${stateId}",
     cases ="${cases}",
     cured="${cured}",
     active ="${active}",
     deaths = "${deaths}"
     WHERE 
       district_id =${districtId};`;

  const updatedData = await db.run(updateData);
  response.send("District Details Updated");
});

// API-7 GET /states/:stateId/stats/

app.get("/states/:stateId/stats/", async (request, response) => {
  const { stateId } = request.params;
  const getStateData = `
    SELECT 
    SUM(cases) as cases,
    SUM(cured) as cured,
    SUM(active) as active,
    SUM(deaths) as deaths
    FROM 
    district
     WHERE 
       state_id =${stateId};`;

  const stateData = await db.get(getStateData);
  response.send(convertDbObjectToDbResponse1(stateData));
  //response.send(
  // stateData.map((eachState) => convertDbObjectToDbResponse1(eachState))
  // );
});

// API-8 GET /districts/:districtId/details/

app.get("/districts/:districtId/details/", async (request, response) => {
  const { districtId } = request.params;

  const getStateData = `
    SELECT 
    state_name
    FROM 
    state INNER JOIN district ON
     state.state_id = district.state_id
     WHERE 
       district_id =${districtId};`;

  const state = await db.get(getStateData);
  response.send(convertDbObjectToDbResponse(state));
});
module.exports = app;
