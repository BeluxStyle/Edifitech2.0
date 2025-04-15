import React, { useState, useEffect } from "react";
import { List, ListItem, ListItemText, IconButton, TextField, Button, Select, MenuItem, InputLabel, FormControl } from "@mui/material";
import { Comunidad, useCompanyHandlers, useComunidades } from "@edifitech-graphql/index";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";

interface CommunityManagementProps {
    companyId: string;
    communities: any[];
}

const CommunityManagement: React.FC<CommunityManagementProps> = ({ companyId, communities }) => {

    useEffect(() => {
        setListCommunities(communities);
    }, []);
    
    const [ListCommunities, setListCommunities] = useState(communities);
    const [newCommunity, setNewCommunity] = useState("");
    const {handleAddCommunity, handleRemoveCommunity} = useCompanyHandlers()
    const {comunidades} = useComunidades()


    return (
        <>
            <h3>Comunidades</h3>
            <List>
                {ListCommunities.map((community) => (
                    <ListItem key={community.id}>
                        <ListItemText primary={community.name} />
                        <IconButton color="error" onClick={() => handleRemoveCommunity(community.id, companyId)}>
                            <DeleteIcon />
                        </IconButton>
                    </ListItem>
                ))}
            </List>
            <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                
                <FormControl fullWidth>
                    <InputLabel id="user-select-label">Seleccionar Comunidad</InputLabel>
                    <Select
                        labelId="user-select-label"
                        fullWidth
                        value={newCommunity}
                        onChange={(e) => setNewCommunity(e.target.value)}
                        label="Seleccionar Usuario"
                    >
                        {comunidades?.map((comunidad: Comunidad) => (
                            <MenuItem key={comunidad.id} value={comunidad.id}>
                                {comunidad.name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <Button variant="contained" onClick={() =>handleAddCommunity(newCommunity, companyId)} startIcon={<AddIcon />}>
                    Añadir
                </Button>
            </div>
        </>
    );
};

export default CommunityManagement;