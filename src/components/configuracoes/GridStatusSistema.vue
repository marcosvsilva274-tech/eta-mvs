<template>
  <div class="config-grid">
    <div class="config-card">
      <span class="config-icon">⇄</span>
      <div>
        <strong>WebSocket / MQTT bridge</strong>
        <p>Canal bidirecional para telemetria e comandos</p>
      </div>
      <span class="config-status">AGUARDANDO</span>
    </div>
    <div class="config-card">
      <span class="config-icon">▣</span>
      <div>
        <strong>Banco de dados</strong>
        <p>Histórico de medições, estados, eventos e alarmes</p>
      </div>
      <span class="config-status">PRONTO</span>
    </div>
    <div class="config-card">
      <span class="config-icon">＋</span>
      <div>
        <strong>Modelo modular</strong>
        <p>Novos sensores e atuadores podem ser adicionados por ID</p>
      </div>
      <span class="config-status">ATIVO</span>
    </div>
  </div>
</template>