
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import SessionProvider from '@/providers/SessionProvider';
import Navbar from '@/components/Navbar';
import PageContainer from '@/components/PageContainer';
import * as React from 'react';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from '@/theme';
import InitColorSchemeScript from '@mui/material/InitColorSchemeScript';

import AProvider from '@/providers/ApolloProvider';
import BreadcrumbsNav from "@/components/BreadcrumsNav"
import CookieConsent from "@/components/CookieConsent";
import Footer from "@/components/Footer"



export default async function RootLayout(props: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  return (
    <html lang="es" suppressHydrationWarning>
      <body>
        <InitColorSchemeScript attribute="class" />
        <AppRouterCacheProvider options={{ enableCssLayer: true }}>
          <SessionProvider session={session}>
            <AProvider>
              <ThemeProvider theme={theme}>
                <Navbar />
                <PageContainer>
                  <BreadcrumbsNav/>
                  {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
                  <CssBaseline />
                  
                  {props.children}
                  <CookieConsent />
                  
                </PageContainer>
                <Footer />
              </ThemeProvider>
            </AProvider>
          </SessionProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}