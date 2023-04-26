import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import AddUnitForm from "./AddUnitForm/AddUnitForm";
import EditIcon from "@mui/icons-material/Edit";
import DoneIcon from "@mui/icons-material/Done";
import ClearIcon from "@mui/icons-material/Clear";
import DragHandleIcon from "@mui/icons-material/DragHandle";
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  IconButton,
  TextField,
} from "@mui/material";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import { tokens } from "../../theme";
import { useTheme } from "@emotion/react";
import accessLevel from "../../config";

function CoursePage() {
  const dispatch = useDispatch();
  const history = useHistory();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const user = useSelector((store) => store.user);
  const allUnits = useSelector((store) => store.unit);
  const userUnits = useSelector((store) => store.userUnitReducer);
  const content = useSelector(store => store.contentReducer);

  //Updated unit to send to the database
  const [updatedUnitToSend, setUpdatedUnitToSend] = useState({
    id: "",
    name: "",
    unitOrder: "",
    subtitle: "",
  });

  const [unitToSwap, setUnitToSwap] = useState({ id: 0, order: 0 });

  const userId = user.id;

  useEffect(() => {
    //get all units
    dispatch({ type: "GET_UNITS" });
    //get IDs of units user has access to
    dispatch({
      type: 'FETCH_USER_UNIT',
      payload: { userId: userId }
    });
  }, []);

  //If a user's access level is that of newRigistrant, show no units
  //If a user's access level is that of a student, map over all available units and include only
  //the units that have a matching ID to what the user has access to. This will create a curated
  //units array to render
  let units = [];

  if (user.access === accessLevel.newRegistrant) {
    units = [];
  } else if (user.access === accessLevel.student) {
    allUnits?.map((unit, i) => {
      userUnits?.includes(unit.id) ? units.push(unit) : <></>;
    });
  } else units = allUnits;

  //Function to set the updatedUnitToSend's initial values to the current values
  const handleEditField = (event, key) => {
    setUpdatedUnitToSend({
      ...updatedUnitToSend,
      [key]: event.target.value,
    });
  };

  // Function to handle editing a unit in the database
  async function postEditedUnit() {
    dispatch({
      type: "UPDATE_UNIT",
      payload: updatedUnitToSend,
    });

    //Unselecting the unit
    setUpdatedUnitToSend({
      id: "",
      name: "",
      unitOrder: "",
      subtitle: "",
    });
  }

  const cancelEdit = () => {
    setUpdatedUnitToSend({
      id: "",
      name: "",
      unitOrder: "",
      subtitle: "",
    });
  };

  const deleteUnit = (id) => {
    dispatch({
      type: "DELETE_UNIT",
      payload: id,
    });
  };

  const selectUnit = (id) => {
    history.push(`/unit/${id}/${user.id}`);
  };


  const swapUnits = (otherUnitToSwap) => {
    dispatch({
      type: "SWAP_UNITS",
      payload: { id: unitToSwap.id, order: otherUnitToSwap.order },
    });

    dispatch({
      type: "SWAP_UNITS",
      payload: { id: otherUnitToSwap.id, order: unitToSwap.order },
    });
  };

  return (
    <Box
      sx={{
        "& .MuiButton-sizeMedium": {
          backgroundColor: colors.tealAccent[500],
        },
        "& .MuiButton-sizeMedium:hover": {
          backgroundColor: colors.tealAccent[700],
        },
        display: "box",
        gridTemplateColumns: "repeat(3, 1fr)",
      }}
      className="container"
    >
      <h1 style={{ marginLeft: 20 }}>Courses</h1>
      <h2 style={{ marginLeft: 20 }}>Welcome, {user.firstName}!</h2>

      {/* If new registrant or student without units assigned, display this greeting */}
      {user.access === accessLevel.newRegistrant || user.access === accessLevel.student && units === [] ?
        <Card id="content">
          <h3>Thank you for joining Baby Know!</h3>
          <p>Your account has been registered and our administration is working to assign your courses!</p>
          <p>If you have any questions, please contact us at babyknowprogram@gmail.com</p>
        </Card> : <></>
      }
      <AddUnitForm />

      <div>
        <Grid
          container
          m={4}
          sx={{
            display: "flex",
            justifyContent: "space-around",
            marginLeft: 0,
          }}
        >
          {units.map((unit, i) => {
            //Variable to check if this card is currently being edited
            const isCurrentlyEditing = updatedUnitToSend.id === unit.id;
            return (
              <div
                id="unitGrid"
                key={i}
                style={{
                  display: "grid",
                  justifyContent: "space-between",
                  cursor: "pointer",
                  marginLeft: 100,
                  marginRight: 100,
                  marginBottom: 25,
                  marginTop: 25,
                }}
              >
                {isCurrentlyEditing ? (
                  <form>
                    <Card
                      key={unit.id}
                      sx={{
                        maxWidth: 320,
                        maxHeight: 1000,
                        justifyContent: "center",
                        backgroundColor: "rgb(245, 245, 245)",
                      }}
                    >
                      <CardContent>
                        <TextField
                          autoFocus
                          margin="dense"
                          fullWidth
                          type="text"
                          label="Unit Name"
                          value={updatedUnitToSend.name}
                          onChange={(event) => handleEditField(event, "name")}
                        />
                        <TextField
                          autoFocus
                          margin="dense"
                          fullWidth
                          type="text"
                          label="Unit Subtitle"
                          value={updatedUnitToSend.subtitle}
                          onChange={(event) =>
                            handleEditField(event, "subtitle")
                          }
                        />
                      </CardContent>
                      <>
                        <IconButton onClick={postEditedUnit}>
                          <DoneIcon />
                        </IconButton>
                        <IconButton onClick={cancelEdit}>
                          <ClearIcon />
                        </IconButton>
                      </>
                    </Card>
                  </form>
                ) : (
                  <Card
                    draggable={user.access === accessLevel.admin ? "true" : "false"}
                    onDragStart={() =>
                      setUnitToSwap({ id: unit.id, order: unit.unitOrder })
                    }
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={() =>
                      swapUnits({ id: unit.id, order: unit.unitOrder })
                    }
                    key={unit.id}
                    sx={{
                      width: 250,
                      height: 250,
                      textAlign: "center",
                      justifyContent: "center",
                      backgroundColor: "rgb(245, 245, 245)",
                    }}
                  >
                    {user.access === accessLevel.admin ? (
                      <IconButton>
                        <DragHandleIcon sx={{ cursor: "grab" }} />
                      </IconButton>
                    ) : (
                      <></>
                    )}
                    <CardContent
                      sx={{ mb: 2 }}
                      onClick={() => selectUnit(unit.id)}
                    >
                      <p
                        style={{
                          marginTop: "0",
                          fontWeight: "bold",
                          fontSize: 18,
                        }}
                      >
                        {unit.name}
                      </p>
                      <p>{unit.subtitle}</p>
                    </CardContent>
                    {user.access === accessLevel.admin ? (
                      <>
                        <IconButton
                          onClick={() => {
                            setUpdatedUnitToSend({
                              id: unit.id,
                              name: unit.name,
                              unitOrder: unit.unitOrder,
                              subtitle: unit.subtitle,
                            });
                          }}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton onClick={() => deleteUnit(unit.id)}>
                          <DeleteForeverIcon />
                        </IconButton>
                      </>
                    ) : (
                      <></>
                    )}
                  </Card>
                )}
              </div>
            );
          })}
        </Grid>
      </div>

      {user.access === accessLevel.admin ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)" }}>
          <Button
            sx={{ margin: 10 }}
            onClick={() => {
              dispatch({
                type: "SET_SHOW_ADD_UNIT",
                payload: true,
              });
            }}
          >
            Add Unit
          </Button>
        </div>
      ) : (
        <></>
      )}
    </Box>
  );
}

export default CoursePage;
