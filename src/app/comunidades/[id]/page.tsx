"use client";

import { EdifitechLoading } from "@/components/CustomIcons";
import PageContainer from "@/components/PageContainer";
import { useComunidad } from "@edifitech-graphql/index";
import { Box, Typography } from "@mui/material";
import { useParams } from "next/navigation";

import DetalleComunidad from "@/components/comunidadDetalle";



export default function ComunidadPage() {

  
  const params = useParams();
  const id = params?.id as string;

  const { comunidad, loading, error, refetch } = useComunidad(id)
 

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
  
  if (error || !comunidad) return <Typography variant="h6" color="error">Comunidad no encontrada</Typography>;


  return (
    <PageContainer>
    <Box sx={{ p: 1}}>    
      <DetalleComunidad comunidad={comunidad} ></DetalleComunidad>
    </Box>
    </PageContainer>
  );
}
