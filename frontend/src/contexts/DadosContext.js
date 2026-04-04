import React, { createContext, useContext, useState, useCallback } from 'react';
import axios from 'axios';

const API_URL = (process.env.REACT_APP_BACKEND_URL || '') + '/api';

const DadosContext = createContext();

export function DadosProvider({ children }) {
  const [loading, setLoading] = useState(false);

  // Carregar lançamentos - sempre busca do servidor (sem cache)
  const carregarLancamentos = useCallback(async (dataInicio = '', dataFim = '') => {
    setLoading(true);
    try {
      let url = `${API_URL}/lancamentos`;
      const params = new URLSearchParams();
      if (dataInicio) params.append('data_inicio', dataInicio);
      if (dataFim) params.append('data_fim', dataFim);
      if (params.toString()) url += `?${params.toString()}`;
      
      const response = await axios.get(url);
      return response.data || [];
    } catch (error) {
      console.error('Erro ao carregar lançamentos:', error);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Carregar estatísticas - sempre busca do servidor
  const carregarStats = useCallback(async (periodo = 'mensal', dataInicio = '', dataFim = '') => {
    setLoading(true);
    try {
      let url = `${API_URL}/relatorios?periodo=${periodo}`;
      if (dataInicio) url += `&data_inicio=${dataInicio}`;
      if (dataFim) url += `&data_fim=${dataFim}`;
      
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error('Erro ao carregar relatórios:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const value = {
    loading,
    carregarLancamentos,
    carregarStats
  };

  return (
    <DadosContext.Provider value={value}>
      {children}
    </DadosContext.Provider>
  );
}

export function useDados() {
  const context = useContext(DadosContext);
  if (!context) {
    throw new Error('useDados deve ser usado dentro de um DadosProvider');
  }
  return context;
}
