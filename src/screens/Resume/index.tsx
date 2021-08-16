import React, { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ScrollView, ActivityIndicator } from 'react-native';
import { VictoryPie } from 'victory-native';
import { useTheme } from 'styled-components';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
// eslint-disable-next-line import/no-duplicates
import { addMonths, subMonths, format } from 'date-fns';
// eslint-disable-next-line import/no-duplicates
import { ptBR } from 'date-fns/locale';

import { RFValue } from 'react-native-responsive-fontsize';
import { useFocusEffect } from '@react-navigation/native';
import { HistoryCar } from '../../components/HistoryCar';

import {
  Container,
  Header,
  Title,
  ChartContainer,
  MonthSelect,
  MonthSelectButton,
  MonthSelectIcon,
  Month,
  LoadContainer,
} from './styles';
import { categories } from '../../utils/categories';
import { useAuth } from '../../hooks/auth';

interface TransactionDataProps {
  type: 'positive' | 'negative';
  name: string;
  amount: string;
  category: string;
  date: string;
}

interface CategoryDataProps {
  key: string;
  name: string;
  total: number;
  totalFormatted: string;
  color: string;
  percent: string;
}

export function Resume() {
  const { user } = useAuth();
  const [isLoading, setIsloading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [totalByCategories, setTotalByCategories] = useState<
    CategoryDataProps[]
  >([]);
  const theme = useTheme();

  const handleChangeDate = useCallback(
    (action: 'next' | 'prev') => () => {
      if (action === 'next') {
        setSelectedDate(state => addMonths(state, 1));
      } else {
        setSelectedDate(state => subMonths(state, 1));
      }
    },
    [],
  );

  const loadData = useCallback(async () => {
    setIsloading(true);
    const key = `@gofinances:transactions_user:${user.id}`;
    const response = await AsyncStorage.getItem(key);
    const responseFormatted = response ? JSON.parse(response) : [];

    const expensives = responseFormatted.filter(
      (expensive: TransactionDataProps) =>
        expensive.type === 'negative' &&
        new Date(expensive.date).getMonth() === selectedDate.getMonth() &&
        new Date(expensive.date).getFullYear() === selectedDate.getFullYear(),
    );

    const expensivesTotal = expensives.reduce(
      (acumullator: number, expensive: TransactionDataProps) => {
        return acumullator + Number(expensive.amount);
      },
      0,
    );

    const totalByCategory: CategoryDataProps[] = [];

    categories.forEach(category => {
      let categorySum = 0;

      expensives.forEach((expensive: TransactionDataProps) => {
        if (expensive.category === category.key) {
          categorySum += Number(expensive.amount);
        }
      });

      if (categorySum > 0) {
        const totalFormatted = categorySum.toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        });

        const percent = `${((categorySum / expensivesTotal) * 100).toFixed(
          0,
        )}%`;

        totalByCategory.push({
          key: category.key,
          name: category.name,
          totalFormatted,
          total: categorySum,
          color: category.color,
          percent,
        });
      }
    });
    setTotalByCategories(totalByCategory);
    setIsloading(false);
  }, [selectedDate, user]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [selectedDate]),
  );

  return (
    <Container>
      <Header>
        <Title>Resumo por Categoria</Title>
      </Header>
      {isLoading ? (
        <LoadContainer>
          <ActivityIndicator color={theme.colors.primary.main} size="large" />
        </LoadContainer>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            // flex: 1,
            paddingHorizontal: RFValue(24),
            // eslint-disable-next-line react-hooks/rules-of-hooks
            paddingBottom: useBottomTabBarHeight(),
          }}
        >
          <MonthSelect>
            <MonthSelectButton onPress={handleChangeDate('prev')}>
              <MonthSelectIcon name="chevron-left" />
            </MonthSelectButton>

            <Month>
              {format(selectedDate, 'MMMM, yyyy', { locale: ptBR })}
            </Month>

            <MonthSelectButton onPress={handleChangeDate('next')}>
              <MonthSelectIcon name="chevron-right" />
            </MonthSelectButton>
          </MonthSelect>

          <ChartContainer>
            <VictoryPie
              data={totalByCategories}
              colorScale={totalByCategories.map(category => category.color)}
              style={{
                labels: {
                  fontSize: RFValue(18),
                  fontWeight: 'bold',
                  fill: theme.colors.shape,
                },
              }}
              labelRadius={50}
              x="percent"
              y="total"
            />
          </ChartContainer>
          {totalByCategories.map(item => (
            <HistoryCar
              key={item.key}
              title={item.name}
              amount={item.totalFormatted}
              color={item.color}
            />
          ))}
        </ScrollView>
      )}
    </Container>
  );
}
