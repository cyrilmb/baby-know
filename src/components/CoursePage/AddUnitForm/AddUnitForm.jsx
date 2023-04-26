import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { useDispatch, useSelector } from "react-redux";
import { Box, useTheme } from "@mui/system";
import { tokens } from "../../../theme";
import { IconButton, TextField, Button } from "@mui/material";
import Close from "@mui/icons-material/Close";
import { useState } from "react";
import axios from "axios";

function AddUnitForm() {
  const dispatch = useDispatch();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  //Variable to show whether the add unit form is showing
  const showForm = useSelector((store) => store.conditionalForms?.showUnitForm);

  //Setting initial values so that they are controlled for MUI
  const [unitToSend, setUnitToSend] = useState({
    name: "",
    subtitle: "",
  });

  //Function to handle sending new unit to the database
  async function handleAddUnit() {
    try {
      await axios.post("/api/unit", unitToSend);
      dispatch({ type: 'GET_UNITS' });

      dispatch({
        type: "SET_SHOW_ADD_UNIT",
        payload: false
      });

      //Clear inputs
      setUnitToSend({
        name: "",
        subtitle: "",
      });
    } catch (error) {
      console.log("Error posting new unit:", error);
    }
  }

  return (
    <Box>
      <Dialog
        open={showForm}
        sx={{
          "& .MuiButton-sizeMedium": {
            backgroundColor: colors.tealAccent[500],
          },
          "& .MuiButton-sizeMedium:hover": {
            backgroundColor: colors.tealAccent[700],
          },
          display: 'box',
          gridTemplateColumns: 'repeat(3, 1fr)',
          "& .MuiPaper-root": {
            backgroundColor: colors.tealAccent[800],
          },
        }}
      >
        <DialogTitle variant="h3" color={colors.primary[500]} mb="5%">
          Add New Unit
          <IconButton
            onClick={() => {
              dispatch({
                type: "SET_SHOW_ADD_UNIT",
                payload: false
              });
            }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            fullWidth
            type="text"
            label="Unit Name"
            value={unitToSend.name}
            onChange={(event) => {
              setUnitToSend({
                ...unitToSend,
                name: event.target.value,
              });
            }}
          />
          <TextField
            autoFocus
            margin="dense"
            fullWidth
            type="text"
            label="Unit Subtitle"
            value={unitToSend.subtitle}
            onChange={(event) => {
              setUnitToSend({
                ...unitToSend,
                subtitle: event.target.value,
              });
            }}
          />
          <Button
            variant="outlined"
            onClick={() => {
              handleAddUnit();
            }}
          >
            Add Unit
          </Button>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
export default AddUnitForm;
