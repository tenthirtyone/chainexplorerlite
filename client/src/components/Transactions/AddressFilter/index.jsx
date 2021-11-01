import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import Card from "@material-ui/core/Card";
import Typography from "@material-ui/core/Typography";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import IconButton from "@material-ui/core/IconButton";
import DeleteIcon from "@material-ui/icons/Delete";
import TextField from "@material-ui/core/TextField";
import Checkbox from "@material-ui/core/Checkbox";

const useStyles = makeStyles((theme) => ({
  addressFilter: {
    minHeight: 200,
    maxHeight: 200,
    overflowY: "auto",
  },
  textField: {
    width: "90%",
  },
}));

export default function AddressFilter({
  heading,
  filterAddresses,
  setFilterAddresses,
}) {
  const [address, setAddress] = useState("");
  const [label, setLabel] = useState("");

  const classes = useStyles();

  function toggleTrackAddress(address) {
    filterAddresses[address].tracked = !filterAddresses[address].tracked;

    setFilterAddresses({ ...filterAddresses });
  }

  function deleteFilterAddress(address) {
    delete filterAddresses[address];
    setFilterAddresses({ ...filterAddresses });
  }

  function addFilterAddress() {
    if (!address) return;

    filterAddresses[address] = {
      tracked: true,
      address,
      label,
    };

    setFilterAddresses({ ...filterAddresses });
    setAddress("");
    setLabel("");
  }

  function changeAddress(e) {
    setAddress(e.target.value);
  }

  function changeLabel(e) {
    setLabel(e.target.value);
  }

  return (
    <Card variant="outlined">
      <Typography variant="h6">Filter {heading}</Typography>

      <TextField
        className={classes.textField}
        label="Address"
        variant="outlined"
        margin="dense"
        value={address}
        onChange={changeAddress}
      />
      <TextField
        className={classes.textField}
        label="Label"
        variant="outlined"
        margin="dense"
        value={label}
        onChange={changeLabel}
      />
      <Button variant="contained" color="primary" onClick={addFilterAddress}>
        Add Address
      </Button>
      <List dense={true} className={classes.addressFilter}>
        {Object.entries(filterAddresses).map((value, index) => {
          const addr = value[1];
          return (
            <ListItem key={index}>
              <ListItemIcon>
                <Checkbox
                  edge="start"
                  checked={addr.tracked}
                  tabIndex={-1}
                  disableRipple
                  onClick={() => {
                    toggleTrackAddress(addr.address);
                  }}
                />
              </ListItemIcon>
              <ListItemText
                primary={addr.label ? addr.label : addr.address}
                secondary={addr.label ? addr.address : null}
              />
              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  onClick={(e) => {
                    deleteFilterAddress(addr.address);
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          );
        })}
      </List>
    </Card>
  );
}
