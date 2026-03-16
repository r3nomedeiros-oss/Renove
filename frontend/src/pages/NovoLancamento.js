import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Plus, Trash2, Save, Eye } from 'lucide-react';

const API_URL = (process.env.REACT_APP_BACKEND_URL || '') + '/api';

function NovoLancamento() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  // Variáveis carregadas do backend
  const [turnos, setTurnos] = useState([]);
  const [formatos, setFormatos] = useState([]);
  const [cores, setCores] = useState([]);
  const [loadingVars, setLoadingVars] = useState(true);
  
  const [lancamento, setLancamento] = useState({
    data: new Date().toISOString().split('T')[0],
    turno: 'A',
    hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    orelha_kg: '',
    aparas_kg: '',
    itens: [
      { formato: '', cor: '', pacote_kg: '', producao_kg: '' }
    ]
  });

  // Carregar variáveis do backend
  useEffect(() => {
    const carregarVariaveis = async () => {
      try {
        const [turnosRes, formatosRes, coresRes] = await Promise.all([
          axios.get(`${API_URL}/variaveis/turnos`),
          axios.get(`${API_URL}/variaveis/formatos`),
          axios.get(`${API_URL}/variaveis/cores`)
        ]);
        
        const turnosAtivos = (turnosRes.data || []).filter(t => t.ativo);
        const formatosAtivos = (formatosRes.data || []).filter(f => f.ativo);
        const coresAtivas = (coresRes.data || []).filter(c => c.ativo);
        
        setTurnos(turnosAtivos);
        setFormatos(formatosAtivos);
        setCores(coresAtivas);
        
        // Definir turno padrão se o turno atual for o padrão 'A' e houver turnos ativos
        if (turnosAtivos.length > 0) {
          setLancamento(prev => {
            // Só atualiza se ainda estiver com o valor inicial
            if (prev.turno === 'A' && !turnosAtivos.find(t => t.nome === 'A')) {
              return {...prev, turno: turnosAtivos[0].nome};
            }
            return prev;
          });
        }
      } catch (error) {
        console.error('Erro ao carregar variáveis:', error);
        // Usar valores padrão se não conseguir carregar
        setTurnos([{id: '1', nome: 'A'}, {id: '2', nome: 'B'}, {id: '3', nome: 'Administrativo'}]);
      } finally {
        setLoadingVars(false);
      }
    };
    
    carregarVariaveis();
  }, []);

  // Atualizar hora automaticamente a cada minuto
  useEffect(() => {
    const interval = setInterval(() => {
      setLancamento(prev => ({
        ...prev,
        hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      }));
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const adicionarItem = () => {
    setLancamento({
      ...lancamento,
      itens: [...lancamento.itens, { formato: '', cor: '', pacote_kg: '', producao_kg: '' }]
    });
  };

  const removerItem = (index) => {
    const novosItens = lancamento.itens.filter((_, i) => i !== index);
    setLancamento({ ...lancamento, itens: novosItens });
  };

  const atualizarItem = (index, field, value) => {
    const novosItens = [...lancamento.itens];
    novosItens[index][field] = value;
    setLancamento({ ...lancamento, itens: novosItens });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await axios.post(`${API_URL}/lancamentos`, lancamento);
      alert('Lançamento criado com sucesso!');
      navigate('/lancamentos');
    } catch (error) {
      console.error('Erro ao criar lançamento:', error);
      alert('Erro ao criar lançamento');
    } finally {
      setLoading(false);
    }
  };

  // Cálculos para pré-visualização
  const previewData = useMemo(() => {
    const producaoTotal = lancamento.itens.reduce((acc, item) => 
      acc + (parseFloat(item.producao_kg) || 0), 0);
    const pacoteTotal = lancamento.itens.reduce((acc, item) => 
      acc + (parseFloat(item.pacote_kg) || 0), 0);
    const orelha = parseFloat(lancamento.orelha_kg) || 0;
    const aparas = parseFloat(lancamento.aparas_kg) || 0;
    const perdasTotal = orelha + aparas;
    const totalGeral = producaoTotal + perdasTotal;
    const percentualPerdas = totalGeral > 0 ? ((perdasTotal / totalGeral) * 100).toFixed(2) : 0;
    
    return {
      producaoTotal: producaoTotal.toFixed(2),
      pacoteTotal: pacoteTotal.toFixed(2),
      perdasTotal: perdasTotal.toFixed(2),
      percentualPerdas,
      itensPreenchidos: lancamento.itens.filter(i => i.formato && i.cor && i.producao_kg).length,
      totalItens: lancamento.itens.length
    };
  }, [lancamento]);

  const formatarData = (dataStr) => {
    if (!dataStr) return '';
    const [ano, mes, dia] = dataStr.split('-');
    return `${dia}/${mes}/${ano}`;
  };

  if (loadingVars) {
    return <div className="loading">Carregando formulário...</div>;
  }

  return (
    <div>
      <div className="page-header">
        <h1>Novo Lançamento</h1>
        <p>Registrar nova produção de sacolas</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="card">
          <h2 style={{marginBottom: '20px'}}>Informações Gerais</h2>
          
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px'}}>
            <div className="form-group">
              <label>Data</label>
              <input
                type="date"
                className="form-control"
                value={lancamento.data}
                onChange={(e) => setLancamento({...lancamento, data: e.target.value})}
                required
              />
            </div>

            <div className="form-group">
              <label>Turno</label>
              <select
                className="form-control"
                value={lancamento.turno}
                onChange={(e) => setLancamento({...lancamento, turno: e.target.value})}
                required
              >
                {turnos.length > 0 ? (
                  turnos.map(turno => (
                    <option key={turno.id} value={turno.nome}>{turno.nome}</option>
                  ))
                ) : (
                  <>
                    <option value="A">Turno A</option>
                    <option value="B">Turno B</option>
                    <option value="Administrativo">Administrativo</option>
                  </>
                )}
              </select>
            </div>
          </div>

          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px'}}>
            <div className="form-group">
              <label>Orelha (kg)</label>
              <input
                type="number"
                step="0.01"
                className="form-control"
                value={lancamento.orelha_kg}
                onChange={(e) => setLancamento({...lancamento, orelha_kg: e.target.value})}
                required
                placeholder="0,00"
              />
            </div>

            <div className="form-group">
              <label>Aparas (kg)</label>
              <input
                type="number"
                step="0.01"
                className="form-control"
                value={lancamento.aparas_kg}
                onChange={(e) => setLancamento({...lancamento, aparas_kg: e.target.value})}
                required
                placeholder="0,00"
              />
            </div>
          </div>
        </div>

        <div className="card">
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
            <h2>Itens de Produção</h2>
            <button type="button" className="btn btn-secondary" onClick={adicionarItem}>
              <Plus size={16} /> Adicionar Item
            </button>
          </div>

          {lancamento.itens.map((item, index) => (
            <div key={index} style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 36px', gap: '10px', alignItems: 'end', background: '#f8fafc', padding: '12px', borderRadius: '8px', marginBottom: '10px', border: '1px solid #e2e8f0'}}>
              <div className="form-group" style={{marginBottom: '0'}}>
                <label style={{fontSize: '12px', marginBottom: '4px'}}>Formato</label>
                {formatos.length > 0 ? (
                  <select
                    className="form-control"
                    value={item.formato}
                    onChange={(e) => atualizarItem(index, 'formato', e.target.value)}
                    required
                    style={{fontSize: '12px', padding: '8px'}}
                  >
                    <option value="">Selecione...</option>
                    {formatos.map(formato => (
                      <option key={formato.id} value={formato.nome}>{formato.nome}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    className="form-control"
                    value={item.formato}
                    onChange={(e) => atualizarItem(index, 'formato', e.target.value)}
                    required
                    placeholder="Ex: 30x40"
                    style={{fontSize: '12px', padding: '8px'}}
                  />
                )}
              </div>

              <div className="form-group" style={{marginBottom: '0'}}>
                <label style={{fontSize: '12px', marginBottom: '4px'}}>Cor</label>
                {cores.length > 0 ? (
                  <select
                    className="form-control"
                    value={item.cor}
                    onChange={(e) => atualizarItem(index, 'cor', e.target.value)}
                    required
                    style={{fontSize: '12px', padding: '8px'}}
                  >
                    <option value="">Selecione...</option>
                    {cores.map(cor => (
                      <option key={cor.id} value={cor.nome}>{cor.nome}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    className="form-control"
                    value={item.cor}
                    onChange={(e) => atualizarItem(index, 'cor', e.target.value)}
                    required
                    placeholder="Ex: Azul"
                    style={{fontSize: '12px', padding: '8px'}}
                  />
                )}
              </div>

              <div className="form-group" style={{marginBottom: '0'}}>
                <label style={{fontSize: '12px', marginBottom: '4px'}}>Pacote (kg)</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-control"
                  value={item.pacote_kg}
                  onChange={(e) => atualizarItem(index, 'pacote_kg', e.target.value)}
                  required
                  placeholder="0,00"
                  style={{fontSize: '12px', padding: '8px'}}
                />
              </div>

              <div className="form-group" style={{marginBottom: '0'}}>
                <label style={{fontSize: '12px', marginBottom: '4px'}}>Produção (kg)</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-control"
                  value={item.producao_kg}
                  onChange={(e) => atualizarItem(index, 'producao_kg', e.target.value)}
                  required
                  placeholder="0,00"
                  style={{fontSize: '12px', padding: '8px'}}
                />
              </div>

              {lancamento.itens.length > 1 && (
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => removerItem(index)}
                  style={{padding: '8px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '36px'}}
                  title="Remover item"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Pré-visualização */}
        <div className="card" style={{background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)', border: '2px solid #0ea5e9'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px'}}>
            <Eye size={24} style={{color: '#0369a1'}} />
            <h2 style={{margin: 0, color: '#0369a1'}}>Pré-visualização do Lançamento</h2>
          </div>
          
          {/* Informações Gerais */}
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', marginBottom: '20px'}}>
            <div style={{background: 'white', padding: '15px', borderRadius: '8px', textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.05)'}}>
              <div style={{fontSize: '12px', color: '#64748b', marginBottom: '5px'}}>Data</div>
              <div style={{fontSize: '18px', fontWeight: '600', color: '#1e293b'}}>{formatarData(lancamento.data)}</div>
            </div>
            <div style={{background: 'white', padding: '15px', borderRadius: '8px', textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.05)'}}>
              <div style={{fontSize: '12px', color: '#64748b', marginBottom: '5px'}}>Turno</div>
              <div style={{fontSize: '18px', fontWeight: '600', color: '#1e293b'}}>{lancamento.turno || '-'}</div>
            </div>
            <div style={{background: 'white', padding: '15px', borderRadius: '8px', textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.05)'}}>
              <div style={{fontSize: '12px', color: '#64748b', marginBottom: '5px'}}>Hora</div>
              <div style={{fontSize: '18px', fontWeight: '600', color: '#1e293b'}}>{lancamento.hora || '-'}</div>
            </div>
            <div style={{background: 'white', padding: '15px', borderRadius: '8px', textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.05)'}}>
              <div style={{fontSize: '12px', color: '#64748b', marginBottom: '5px'}}>Itens</div>
              <div style={{fontSize: '18px', fontWeight: '600', color: '#1e293b'}}>{previewData.itensPreenchidos}/{previewData.totalItens}</div>
            </div>
          </div>

          {/* Totais */}
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', marginBottom: '20px'}}>
            <div style={{background: '#22c55e', padding: '15px', borderRadius: '8px', textAlign: 'center'}}>
              <div style={{fontSize: '12px', color: 'rgba(255,255,255,0.8)', marginBottom: '5px'}}>Produção Total</div>
              <div style={{fontSize: '22px', fontWeight: '700', color: 'white'}}>{previewData.producaoTotal} kg</div>
            </div>
            <div style={{background: '#3b82f6', padding: '15px', borderRadius: '8px', textAlign: 'center'}}>
              <div style={{fontSize: '12px', color: 'rgba(255,255,255,0.8)', marginBottom: '5px'}}>Pacote Total</div>
              <div style={{fontSize: '22px', fontWeight: '700', color: 'white'}}>{previewData.pacoteTotal} kg</div>
            </div>
            <div style={{background: '#ef4444', padding: '15px', borderRadius: '8px', textAlign: 'center'}}>
              <div style={{fontSize: '12px', color: 'rgba(255,255,255,0.8)', marginBottom: '5px'}}>Perdas Total</div>
              <div style={{fontSize: '22px', fontWeight: '700', color: 'white'}}>{previewData.perdasTotal} kg</div>
            </div>
            <div style={{background: '#f97316', padding: '15px', borderRadius: '8px', textAlign: 'center'}}>
              <div style={{fontSize: '12px', color: 'rgba(255,255,255,0.8)', marginBottom: '5px'}}>% Perdas</div>
              <div style={{fontSize: '22px', fontWeight: '700', color: 'white'}}>{previewData.percentualPerdas}%</div>
            </div>
          </div>

          {/* Detalhamento Perdas */}
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px'}}>
            <div style={{background: 'white', padding: '12px 15px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #fecaca'}}>
              <span style={{color: '#64748b'}}>Orelha</span>
              <span style={{fontWeight: '600', color: '#dc2626'}}>{parseFloat(lancamento.orelha_kg || 0).toFixed(2)} kg</span>
            </div>
            <div style={{background: 'white', padding: '12px 15px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #fecaca'}}>
              <span style={{color: '#64748b'}}>Aparas</span>
              <span style={{fontWeight: '600', color: '#dc2626'}}>{parseFloat(lancamento.aparas_kg || 0).toFixed(2)} kg</span>
            </div>
          </div>

          {/* Lista de Itens */}
          {lancamento.itens.some(i => i.formato || i.cor) && (
            <div>
              <div style={{fontSize: '14px', fontWeight: '600', color: '#475569', marginBottom: '10px'}}>Itens de Produção:</div>
              <div style={{background: 'white', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0'}}>
                <table style={{width: '100%', borderCollapse: 'collapse'}}>
                  <thead>
                    <tr style={{background: '#f8fafc'}}>
                      <th style={{padding: '10px 15px', textAlign: 'left', fontSize: '12px', color: '#64748b', borderBottom: '1px solid #e2e8f0'}}>Formato</th>
                      <th style={{padding: '10px 15px', textAlign: 'left', fontSize: '12px', color: '#64748b', borderBottom: '1px solid #e2e8f0'}}>Cor</th>
                      <th style={{padding: '10px 15px', textAlign: 'right', fontSize: '12px', color: '#64748b', borderBottom: '1px solid #e2e8f0'}}>Pacote (kg)</th>
                      <th style={{padding: '10px 15px', textAlign: 'right', fontSize: '12px', color: '#64748b', borderBottom: '1px solid #e2e8f0'}}>Produção (kg)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lancamento.itens.filter(i => i.formato || i.cor || i.pacote_kg || i.producao_kg).map((item, idx) => (
                      <tr key={idx} style={{borderBottom: idx < lancamento.itens.length - 1 ? '1px solid #f1f5f9' : 'none'}}>
                        <td style={{padding: '10px 15px', fontSize: '14px', color: '#1e293b'}}>{item.formato || '-'}</td>
                        <td style={{padding: '10px 15px', fontSize: '14px', color: '#1e293b'}}>{item.cor || '-'}</td>
                        <td style={{padding: '10px 15px', fontSize: '14px', color: '#1e293b', textAlign: 'right'}}>{parseFloat(item.pacote_kg || 0).toFixed(2)}</td>
                        <td style={{padding: '10px 15px', fontSize: '14px', color: '#1e293b', textAlign: 'right', fontWeight: '600'}}>{parseFloat(item.producao_kg || 0).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div style={{display: 'flex', gap: '10px'}}>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            <Save size={16} /> {loading ? 'Salvando...' : 'Salvar Lançamento'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/lancamentos')}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}

export default NovoLancamento;
