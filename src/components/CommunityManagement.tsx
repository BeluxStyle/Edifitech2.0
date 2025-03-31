import React, { useState, useEffect } from "react";
import { List, ListItem, ListItemText, IconButton, TextField, Button, Select, MenuItem, InputLabel, FormControl } from "@mui/material";
import { useMutation, useQuery } from "@apollo/client";
import { ADD_COMMUNITY_TO_COMPANY, REMOVE_COMMUNITY_FROM_COMPANY, GET_COMUNIDADES } from "@/graphql/queries";
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
    const [addCommunityToCompany] = useMutation(ADD_COMMUNITY_TO_COMPANY, {
        refetchQueries: ["ListCompanies"]
    });
    const [removeCommunityFromCompany] = useMutation(REMOVE_COMMUNITY_FROM_COMPANY, {
        refetchQueries: ["ListCompanies"]
    });
    const { data } = useQuery(GET_COMUNIDADES);

    const handleAddCommunity = async () => {
        if (!newCommunity.trim()) return;
        try {
            const response = await addCommunityToCompany({
                variables: { companyId, comunidadId: newCommunity },
            });
            setListCommunities(response.data.addCommunityToCompany.comunidades)
            setNewCommunity(""); // Limpiar el campo
        } catch (error) {
            console.error("Error al añadir comunidad:", error);
        }
    };

    const handleRemoveCommunity = async (communityId: string) => {
        try {
            const response = await removeCommunityFromCompany({
                variables: { companyId, comunidadId: communityId },
            });
            setListCommunities(response.data.removeCommunityFromCompany.comunidades)
        } catch (error) {
            console.error("Error al eliminar comunidad:", error);
        }
    };

    return (
        <>
            <h3>Comunidades</h3>
            <List>
                {ListCommunities.map((community) => (
                    <ListItem key={community.id}>
                        <ListItemText primary={community.name} />
                        <IconButton color="error" onClick={() => handleRemoveCommunity(community.id)}>
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
                        {data?.listComunidades?.map((comunidad) => (
                            <MenuItem key={comunidad.id} value={comunidad.id}>
                                {comunidad.name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <Button variant="contained" onClick={handleAddCommunity} startIcon={<AddIcon />}>
                    Añadir
                </Button>
            </div>
        </>
    );
};

export default CommunityManagement;