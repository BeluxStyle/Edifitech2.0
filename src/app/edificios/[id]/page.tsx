"use client";

import { useParams } from "next/navigation";
import { EdifitechLoading } from "@/components/CustomIcons";
import DetalleEdificio from "@/components/edificioDetalle";
import PageContainer from "@/components/PageContainer";
import { useEdificio } from "@edifitech-graphql/index";
import { Box, Typography } from "@mui/material";



export default function EdificioPage() {

  
  const params = useParams();
  const id = params.id as string;

  const { edificio, loading, error, refetch } = useEdificio(id)

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
  
  if (error || !edificio) return <Typography variant="h6" color="error">Edificio no encontrado</Typography>;


  return (
    <PageContainer>
    <Box sx={{ p: 1}}>    
      <DetalleEdificio edificio={edificio} ></DetalleEdificio>
    </Box>
    </PageContainer>
  );
}
