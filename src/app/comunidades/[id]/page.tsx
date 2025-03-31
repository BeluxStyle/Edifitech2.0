"use client";

import { EdifitechLoading } from "@/components/CustomIcons";
import PageContainer from "@/components/PageContainer";
import { GET_COMUNIDAD } from "@/graphql/queries";
import { useQuery } from "@apollo/client";
import { Box, Typography } from "@mui/material";
import { useParams } from "next/navigation";

import DetalleComunidad from "@/components/comunidadDetalle";



export default function ComunidadPage() {

  
  const params = useParams();
  const id = params.id as string;

  const { data, loading, error } = useQuery(GET_COMUNIDAD, { variables: { id }  ,  fetchPolicy: "cache-and-network" });
 

  if (loading) {
    return (
      <PageContainer>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
            width: "100%",
            gap: 2,
          }}
        >
          <EdifitechLoading sx={{height: 100, width: 100, fill: "secondary"}} />
          <Box sx={{ width: "50%" }}>
            <Typography variant="body2" align="center">Cargando...</Typography>
          </Box>
        </Box>
      </PageContainer>
    );
  }
  
  if (error || !data?.getComunidad) return <Typography variant="h6" color="error">Comunidad no encontrada</Typography>;


  return (
    <PageContainer>
    <Box sx={{ p: 1}}>    
      <DetalleComunidad comunidad={data.getComunidad} ></DetalleComunidad>
    </Box>
    </PageContainer>
  );
}
