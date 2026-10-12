export const ETAPAS_PROCESSO = {
  Inicial: { numero: 1, nome: 'Enchendo Tanque de Armazenamento' },
  VerificNivelAltoArmaz: { numero: 2, nome: 'Verificando Nível Alto (Armazenamento)' },
  EsvaziandoTqArmaz: { numero: 3, nome: 'Esvaziando Tanque de Armazenamento' },
  VerificTransferenciaAtivos: { numero: 4, nome: 'Verificando Nível (Tanque de Ativos)' },
  DosandoCoagulante: { numero: 5, nome: 'Dosando Coagulante' },
  VerificandoPh: { numero: 5, nome: 'Verificando pH' },
  DosandoAlcalinizante: { numero: 5, nome: 'Dosando Alcalinizante' },
  DosandoSanitizante: { numero: 5, nome: 'Dosando Sanitizante' },
  PreparaCoagulacao: { numero: 6, nome: 'Homogeneização / Preparo Coagulação' },
  Decantacao: { numero: 7, nome: 'Aguardando Decantação' },
  PreparandoLibercaoSedimentos: { numero: 8, nome: 'Preparando Liberação de Sedimentos' },
  RemovendoSedimentos: { numero: 9, nome: 'Removendo Sedimentos' },
  PreparandoEsvaziamentoAtivos: { numero: 10, nome: 'Preparando Esvaziamento de Ativos' },
  EsvaziandoTanqueAtivos: { numero: 11, nome: 'Esvaziando Tanque de Ativos' },
  VerificTransferenciaFinal: { numero: 12, nome: 'Verificando Nível (Tanque Final)' },
  TratamentoUv: { numero: 13, nome: 'Tratamento com Luz UV' },
  Finalizado: { numero: 14, nome: 'Processo Finalizado' }
}

/**
 * Retorna os dados formatados da etapa recebida via MQTT chave 'etapa_atual'
 */
export function formatarEtapa(chaveEtapa) {
  if (!chaveEtapa || !ETAPAS_PROCESSO[chaveEtapa]) {
    return { numero: 0, total: 14, nome: chaveEtapa || 'Aguardando...' }
  }
  return {
    ...ETAPAS_PROCESSO[chaveEtapa],
    total: 14
  }
}