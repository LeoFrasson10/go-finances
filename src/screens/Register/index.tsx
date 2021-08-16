import React, { useState, useCallback } from 'react';
import {
  Keyboard,
  Modal,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import uuid from 'react-native-uuid';
import * as Yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigation } from '@react-navigation/native';
import { useForm } from 'react-hook-form';

import { Button } from '../../components/Forms/Button';
import { CategorySelectButton } from '../../components/Forms/CategorySelectButton';
import { InputForm } from '../../components/Forms/InputForm';
import { TransactionTypeButton } from '../../components/Forms/TransactionTypeButton';

import { CategorySelect } from '../CategorySelect';

import {
  Container,
  Header,
  Title,
  Form,
  Fields,
  TransactionTypes,
} from './styles';
import { useAuth } from '../../hooks/auth';

interface FormData {
  name: string;
  amount: string;
}

const schema = Yup.object().shape({
  name: Yup.string().required('Nome é obrigatório'),
  amount: Yup.number()
    .typeError('Informe um valor numérico')
    .positive('O valor não pode ser negativo')
    .required('O valor é obrigatório'),
});

export function Register() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [transactionType, setTransactionType] = useState('');
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);

  const [category, setCategory] = useState({
    key: 'category',
    name: 'Categoria',
  });

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema) });

  const handleTransactionTypeSelect = (type: 'positive' | 'negative') => () => {
    setTransactionType(type);
  };

  const handleCloseSelectCategory = () => {
    setCategoryModalOpen(false);
  };

  const handleOpenSelectCategory = () => {
    setCategoryModalOpen(true);
  };

  // eslint-disable-next-line consistent-return
  const handleRegister = useCallback(
    async (form: FormData) => {
      const key = `@gofinances:transactions_user:${user.id}`;
      if (!transactionType) {
        return Alert.alert('Selecione o tipo da transação');
      }

      if (category.key === 'category') {
        return Alert.alert('Selecione a categoria');
      }

      const newData = {
        id: String(uuid.v4()),
        name: form.name,
        amount: form.amount,
        type: transactionType,
        category: category.key,
        date: new Date(),
      };

      try {
        const data = await AsyncStorage.getItem(key);
        const currentData = data ? JSON.parse(data) : [];

        const dataFormatted = [...currentData, newData];
        await AsyncStorage.setItem(key, JSON.stringify(dataFormatted));

        reset();
        setTransactionType('');
        setCategory({ key: 'category', name: 'Categoria' });
        navigation.navigate('Listagem');
      } catch (error) {
        console.log(error);
        Alert.alert('Não foi possível salvar!');
      }
    },
    [user, transactionType, category],
  );

  // useEffect(() => {
  //   async function loadData() {
  //     const data = await AsyncStorage.getItem(key);
  //     console.log(JSON.parse(data!));
  //   }
  //   loadData();
  //   // async function removeAll() {
  //   //   await AsyncStorage.removeItem(key);
  //   // }
  //   // removeAll();
  // }, []);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <Container>
          <Header>
            <Title>Cadastro</Title>
          </Header>
          <Form>
            <Fields>
              <InputForm
                control={control}
                name="name"
                placeholder="Nome"
                autoCapitalize="sentences"
                autoCorrect={false}
                error={errors.name && errors.name.message}
              />

              <InputForm
                control={control}
                placeholder="Preço"
                name="amount"
                keyboardType="numeric"
                autoCorrect={false}
                error={errors.amount && errors.amount.message}
              />

              <TransactionTypes>
                <TransactionTypeButton
                  title="Income"
                  type="up"
                  onPress={handleTransactionTypeSelect('positive')}
                  isActive={transactionType === 'positive'}
                />
                <TransactionTypeButton
                  title="Outcome"
                  type="down"
                  onPress={handleTransactionTypeSelect('negative')}
                  isActive={transactionType === 'negative'}
                />
              </TransactionTypes>
              <CategorySelectButton
                title={category.name}
                onPress={handleOpenSelectCategory}
              />
            </Fields>
            <Button title="Enviar" onPress={handleSubmit(handleRegister)} />
          </Form>
          <Modal visible={categoryModalOpen}>
            <CategorySelect
              category={category}
              setCategory={setCategory}
              closeSelectCategory={handleCloseSelectCategory}
            />
          </Modal>
        </Container>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
