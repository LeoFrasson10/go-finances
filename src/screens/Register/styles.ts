import styled from 'styled-components/native';
import { RFPercentage, RFValue } from 'react-native-responsive-fontsize';
import { Feather } from '@expo/vector-icons';

export const Container = styled.View`
  background-color: ${({ theme }) => theme.colors.background};
  flex: 1;
`

export const Header = styled.View`
  background-color: ${({ theme }) => theme.colors.primary.main};
  width: 100%;
  height: ${RFValue(113)}px;
  align-items: center;
  justify-content: flex-end;
  padding-bottom: 19px;
`

export const Title = styled.Text`
  color: ${({ theme }) => theme.colors.shape};
  font-size: ${RFValue(18)}px;
  font-family: ${({ theme }) => theme.fonts.regular};
`

export const Form = styled.View`
  flex: 1;
  justify-content: space-between;
  width: 100%;
  padding: 24px;
`
export const Fields = styled.View``

export const TransactionTypes = styled.View`
  flex-direction: row;
  justify-content: space-between;
  margin: 8px 0 16px;
`


