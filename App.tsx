import 'react-native-gesture-handler';
import 'intl';
import 'intl/locale-data/jsonp/pt-BR';
import React from 'react';
import AppLoading from 'expo-app-loading';
import { ThemeProvider } from 'styled-components';
import { StatusBar } from 'react-native';

import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';
import { Routes } from './src/routes';

import theme from './src/global/styles/theme';
import { AuthProvider, useAuth } from './src/hooks/auth';
import { AppRoutes } from './src/routes/app.routes';

import { SignIn } from './src/screens/SignIn';

export default function App() {
  const { isLoading } = useAuth();
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_700Bold,
  });

  if (!fontsLoaded || isLoading) {
    return <AppLoading />;
  }

  return (
    <ThemeProvider theme={theme}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={theme.colors.primary.main}
      />
      {/* <AppRoutes /> */}
      <AuthProvider>
        <Routes />
      </AuthProvider>
    </ThemeProvider>
  );
}
