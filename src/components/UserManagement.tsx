import React, { useEffect, useState } from "react";
import { List, ListItem, ListItemText, IconButton, Button, Select, MenuItem, InputLabel, FormControl } from "@mui/material";
import { useMutation, useQuery } from "@apollo/client";
import { ADD_USER_TO_COMPANY, REMOVE_USER_FROM_COMPANY, GET_USERS } from "@/graphql/queries";
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
    const [addUserToCompany] = useMutation(ADD_USER_TO_COMPANY, {
        refetchQueries: ["ListCompanies"]
    });
    const [removeUserFromCompany] = useMutation(REMOVE_USER_FROM_COMPANY, {
        refetchQueries: ["ListCompanies"]
    });
    const { data } = useQuery(GET_USERS);

    const handleAddUser = async () => {
        if (!newUser.trim()) return;
        try {
            const response = await addUserToCompany({
                variables: { companyId, userId: newUser },
            });
            setListUsers(response.data.addUserToCompany.users)
            setNewUser(""); // Limpiar el campo
        } catch (error) {
            console.error("Error al añadir usuario:", error);
        }
    };

    const handleRemoveUser = async (userId: string) => {
        try {
            const response = await removeUserFromCompany({
                variables: { companyId, userId },
            });
            setListUsers(response.data.removeUserFromCompany.users)
        } catch (error) {
            console.error("Error al eliminar usuario:", error);
        }
    };

    return (
        <>
            <h3>Usuarios</h3>
            <List>
                {ListUsers.map((user) => (
                    <ListItem key={user.id}>
                        <ListItemText primary={user.name} secondary={user.email} />
                        <IconButton color="error" onClick={() => handleRemoveUser(user.id)}>
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
                        {data?.listUsers?.map((user) => (
                            <MenuItem key={user.id} value={user.id}>
                                {user.name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <Button variant="contained" onClick={handleAddUser} startIcon={<AddIcon />}>
                    Añadir
                </Button>
            </div>
        </>
    );
};

export default UserManagement;