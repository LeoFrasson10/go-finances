/* eslint-disable prefer-spread */
import React, { useState, useEffect, useCallback } from 'react';
import { ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from 'styled-components';
import { HighlightCard } from '../../components/HightlightCard';
import {
  TransactionCard,
  TransactionCardProps,
} from '../../components/TransactionCard';

import {
  Container,
  Header,
  UserContainer,
  UserInfo,
  Photo,
  User,
  UserGreeting,
  UserName,
  Icon,
  HighlightCards,
  Transaction,
  Title,
  TransactionList,
  LogoutButton,
  LoadContainer,
} from './styles';
import { useAuth } from '../../hooks/auth';

export interface DataListProps extends TransactionCardProps {
  id: string;
}

interface HighlightProps {
  amount: string;
  lastTransaction: string;
}

interface HighlightData {
  entries: HighlightProps;
  expensive: HighlightProps;
  total: HighlightProps;
}

function getLastTransaction(
  collection: DataListProps[],
  type: 'positive' | 'negative',
) {
  const collectionFilttered = collection.filter(item => item.type === type);

  if (collectionFilttered.length === 0) {
    return 0;
  }

  const lastTransaction = new Date(
    Math.max.apply(
      Math,
      collectionFilttered.map(item => new Date(item.date).getTime()),
    ),
  );
  if (lastTransaction.getDate()) {
    return `${lastTransaction.getDate()} de ${lastTransaction.toLocaleDateString(
      'pt-BR',
      { month: 'long' },
    )}`;
  }
}

export function Dashboard() {
  const theme = useTheme();
  const { signOut, user } = useAuth();
  const [isLoading, setIsloading] = useState(true);
  const [data, setData] = useState<DataListProps[]>([]);
  const [highlightData, setHighlightData] = useState<HighlightData>(
    {} as HighlightData,
  );

  const loadTransaction = async () => {
    const key = `@gofinances:transactions_user:${user.id}`;
    const response = await AsyncStorage.getItem(key);
    const transactions = response ? JSON.parse(response) : [];

    let entriesTotal = 0;
    let expensiveTotal = 0;

    const transactionsFormatted: DataListProps[] = transactions.map(
      (item: DataListProps) => {
        if (item.type === 'negative') {
          expensiveTotal += Number(item.amount);
        } else {
          entriesTotal += Number(item.amount);
        }

        const amount = Number(item.amount).toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        });

        const date = Intl.DateTimeFormat('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: '2-digit',
        }).format(new Date(item.date));

        return {
          ...item,
          amount,
          date,
        };
      },
    );

    const lastTransactionEntries = getLastTransaction(transactions, 'positive');
    const lastTransactionExpensive = getLastTransaction(
      transactions,
      'negative',
    );

    const totalInterval =
      lastTransactionExpensive === 0
        ? 'Não há transações'
        : `01 a ${lastTransactionExpensive}`;

    const total = entriesTotal - expensiveTotal;

    setHighlightData({
      entries: {
        amount: entriesTotal.toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        }),
        lastTransaction:
          lastTransactionEntries === 0
            ? 'Não há transações'
            : `Última entrada dia ${lastTransactionEntries}`,
      },
      expensive: {
        amount: expensiveTotal.toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        }),
        lastTransaction:
          lastTransactionExpensive === 0
            ? 'Não há transações'
            : `Última saída dia ${lastTransactionExpensive}`,
      },
      total: {
        amount: total.toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        }),
        lastTransaction: totalInterval,
      },
    });

    setData(transactionsFormatted);
    setIsloading(false);
  };

  useEffect(() => {
    loadTransaction();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadTransaction();
    }, []),
  );

  return (
    <Container>
      {isLoading ? (
        <LoadContainer>
          <ActivityIndicator color={theme.colors.primary.main} size="large" />
        </LoadContainer>
      ) : (
        <>
          <Header>
            <UserContainer>
              <UserInfo>
                <Photo
                  source={{
                    uri: user.photo,
                  }}
                />

                <User>
                  <UserGreeting>Olá,</UserGreeting>
                  <UserName>{user.name}</UserName>
                </User>
              </UserInfo>
              <LogoutButton onPress={signOut}>
                <Icon name="power" />
              </LogoutButton>
            </UserContainer>
          </Header>

          <HighlightCards>
            <HighlightCard
              title="Entradas"
              lastTransaction={highlightData.entries.lastTransaction}
              amount={highlightData.entries.amount}
              type="up"
            />
            <HighlightCard
              title="Saídas"
              lastTransaction={highlightData.expensive.lastTransaction}
              amount={highlightData.expensive.amount}
              type="down"
            />
            <HighlightCard
              title="Total"
              lastTransaction={highlightData.total.lastTransaction}
              amount={highlightData.total.amount}
              type="total"
            />
          </HighlightCards>

          <Transaction>
            <Title>Listagem</Title>

            <TransactionList
              data={data}
              keyExtractor={item => item.id}
              renderItem={({ item }) => <TransactionCard data={item} />}
            />
          </Transaction>
        </>
      )}
    </Container>
  );
}
