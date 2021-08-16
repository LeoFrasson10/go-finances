import styled, { css } from 'styled-components/native';
import { RFPercentage, RFValue } from 'react-native-responsive-fontsize';
import { Feather } from '@expo/vector-icons';

interface TypeProps {
  type: 'up' | 'down' | 'total';
}

export const Container = styled.View<TypeProps>`
  background-color: ${({ theme, type }) =>
    type === 'total' ? theme.colors.secondary.main : theme.colors.shape
  };
  width: ${RFValue(300)}px;
  border-radius: 5px;

  padding: 19px 23px ${RFValue(42)}px;
  margin-right: 16px;

  /* height: 300px; */
`;

export const Header = styled.View`
  flex-direction: row;
  justify-content: space-between;
`;

export const Title = styled.Text<TypeProps>`
  font-size: ${RFValue(14)}px;
  font-family: ${({ theme }) => theme.fonts.regular};
  color: ${({ theme, type }) => type === 'total' ? theme.colors.shape : theme.colors.textDark};
`;

export const Icon = styled(Feather)<TypeProps>`
  font-size: ${RFValue(40)}px;

  ${({type}) => type === "up" && css`
    color: ${({ theme }) => theme.colors.success.main};
  `};
  ${({type}) => type === "down" && css`
    color: ${({ theme }) => theme.colors.attention.main};
  `};
  ${({type}) => type === "total" && css`
    color: ${({ theme }) => theme.colors.shape};
  `};

`;

export const Footer = styled.View``;

export const Amount = styled.Text<TypeProps>`
  color: ${({ theme, type }) => type === 'total' ? theme.colors.shape : theme.colors.textDark};
  font-size: ${RFValue(32)}px;
  font-family: ${({ theme }) => theme.fonts.medium};
  margin-top: 38px;
`;

export const LastTransaction = styled.Text<TypeProps>`
  color: ${({ theme, type }) => type === 'total' ? theme.colors.shape : theme.colors.text};
  font-size: ${RFValue(12)}px;
  font-family: ${({ theme }) => theme.fonts.regular};
`;


