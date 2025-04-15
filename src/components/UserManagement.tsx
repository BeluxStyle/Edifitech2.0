import React, { useEffect, useState } from "react";
import { List, ListItem, ListItemText, IconButton, Button, Select, MenuItem, InputLabel, FormControl } from "@mui/material";
import { useCompanyHandlers, User, useUsers } from "@edifitech-graphql/index";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";

interface UserManagementProps {
    companyId: string;
    users: any[];
}

const UserManagement: React.FC<UserManagementProps> = ({ companyId, users }) => {
    useEffect(() => {
        setListUsers(users);
    }, []);
    const [newUser, setNewUser] = useState("");
    const [ListUsers, setListUsers] = useState(users);
    const {handleRemoveUser, handleAddUser} = useCompanyHandlers()
    const {users: newUsers} = useUsers()

    

    return (
        <>
            <h3>Usuarios</h3>
            <List>
                {ListUsers.map((user) => (
                    <ListItem key={user.id}>
                        <ListItemText primary={user.name} secondary={user.email} />
                        <IconButton color="error" onClick={() => handleRemoveUser(user.id, companyId)}>
                            <DeleteIcon />
                        </IconButton>
                    </ListItem>
                ))}
            </List>
            <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                <FormControl fullWidth>
                    <InputLabel id="user-select-label">Seleccionar Usuario</InputLabel>
                    <Select
                        labelId="user-select-label"
                        fullWidth
                        value={newUser}
                        onChange={(e) => setNewUser(e.target.value)}
                        label="Seleccionar Usuario"
                    >
                        {newUsers?.map((user:User) => (
                            <MenuItem key={user.id} value={user.id}>
                                {user.name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <Button variant="contained" onClick={() => handleAddUser(newUser, companyId)} startIcon={<AddIcon />}>
                    Añadir
                </Button>
            </div>
        </>
    );
};

export default UserManagement;