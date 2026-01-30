
import React, { useState } from 'react';
import { useAppStore } from '../hooks/useAppStore';

const PrintingDocuments: React.FC = () => {
    const { logAction } = useAppStore();
    const [activeDoc, setActiveDoc] = useState<'transport' | 'generator'>('transport');

    const transportReceiptDoc = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Recibo de Prestação de Serviço - Transporte (EDITÁVEL)</title>
  <style>
    body {
      font-family: Arial, Helvetica, sans-serif;
      background: #f5f5f5;
      padding: 20px;
      margin: 0;
    }
    
    .editable-notice {
      max-width: 800px;
      margin: 0 auto 20px auto;
      background: #fff8e1;
      border: 2px solid #ffd54f;
      border-radius: 5px;
      padding: 15px;
      text-align: center;
    }
    
    .editable-notice h3 {
      color: #e65100;
      margin-top: 0;
    }
    
    .editable-notice ul {
      text-align: left;
      max-width: 600px;
      margin: 10px auto;
    }
    
    .recibo {
      max-width: 800px;
      margin: auto;
      background: #ffffff;
      padding: 30px;
      border: 1px solid #ccc;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    
    h1 {
      text-align: center;
      margin-bottom: 5px;
      color: #2c5aa0;
    }
    
    h2 {
      text-align: center;
      font-weight: normal;
      margin-top: 0;
      color: #555;
    }
    
    .linha {
      border-bottom: 1px solid #ddd;
      margin: 20px 0;
    }
    
    .bloco {
      margin-bottom: 15px;
      line-height: 1.6;
    }
    
    .bloco strong {
      display: inline-block;
      width: 220px;
      color: #333;
    }
    
    .valor {
      font-size: 18px;
      font-weight: bold;
      color: #000;
    }
    
    .rodape {
      margin-top: 40px;
      font-size: 12px;
      color: #555;
      text-align: center;
    }
    
    .assinatura {
      margin-top: 60px;
      text-align: center;
    }
    
    /* Estilos para campos editáveis */
    .campo-editavel {
      display: inline-block;
      min-width: 200px;
      border: 1px dashed #2c5aa0;
      background-color: #f0f7ff;
      padding: 2px 6px;
      margin: 1px 0;
      cursor: text;
      border-radius: 2px;
    }
    
    .campo-editavel.valor {
      background-color: #fff8e1;
      border-color: #ff9800;
    }
    
    .campo-grande {
      display: inline-block;
      min-width: 400px;
      min-height: 24px;
      border: 1px dashed #2c5aa0;
      background-color: #f0f7ff;
      padding: 4px 8px;
      margin: 5px 0;
      cursor: text;
      border-radius: 2px;
    }
    
    .campo-grande.multilinha {
      display: block;
      width: 100%;
      min-height: 60px;
      margin: 10px 0;
    }
    
    .controles {
      text-align: center;
      margin: 20px auto;
      max-width: 800px;
    }
    
    .btn {
      background-color: #2c5aa0;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 4px;
      cursor: pointer;
      font-weight: bold;
      margin: 5px 10px;
      font-size: 14px;
    }
    
    .btn:hover {
      background-color: #1e3a6f;
    }
    
    .btn-secundario {
      background-color: #666;
    }
    
    .btn-secundario:hover {
      background-color: #444;
    }
    
    @media print {
      body {
        padding: 0;
        background: white;
      }
      
      .editable-notice, .controles {
        display: none;
      }
      
      .campo-editavel, .campo-grande {
        border: none;
        background-color: transparent;
        padding: 0;
      }
    }
  </style>
</head>
<body>

<div class="editable-notice">
  <h3>📝 DOCUMENTO EDITÁVEL</h3>
  <p><strong>Como usar:</strong></p>
  <ul>
    <li>Clique em qualquer campo com borda tracejada para editar o conteúdo</li>
    <li>Use o botão "Atualizar Data" para inserir a data atual automaticamente</li>
    <li>Use o botão "Imprimir" para gerar uma versão limpa para impressão</li>
    <li>O botão "Limpar Campos" redefine todos os campos editáveis</li>
  </ul>
</div>

<div class="controles">
  <button id="btnAtualizarData" class="btn">📅 Atualizar Data</button>
  <button id="btnImprimir" class="btn">🖨️ Imprimir</button>
  <button id="btnLimpar" class="btn btn-secundario">🗑️ Limpar Campos</button>
</div>

<div class="recibo">

  <h1 contenteditable="true" class="campo-grande" style="text-align: center; min-width: 500px;">RECIBO DE PRESTAÇÃO DE SERVIÇO</h1>
  <h2 contenteditable="true" class="campo-editavel" style="min-width: 300px; display: block; text-align: center; margin: 0 auto;">Serviço de Transporte Rodoviário</h2>

  <div class="linha"></div>

  <div class="bloco">
    <strong>Prestador do Serviço:</strong> 
    <span contenteditable="true" class="campo-editavel">ImperiLog Transportes LTDA</span><br>
    
    <strong>CNPJ:</strong> 
    <span contenteditable="true" class="campo-editavel">32.243.464/0001-15</span><br>
    
    <strong>Endereço:</strong> 
    <span contenteditable="true" class="campo-grande">Avenida Brasil, 02520 – Caju – Rio de Janeiro/RJ</span><br>
    
    <strong>Email:</strong> 
    <span contenteditable="true" class="campo-editavel">comercial@imperio.log.br</span>
  </div>

  <div class="linha"></div>

  <div class="bloco">
    <strong>Cliente / Tomador do Serviço:</strong> 
    <span contenteditable="true" class="campo-editavel">O Galpão – Objetos Móveis e Decorações LTDA</span><br>
    
    <strong>CNPJ:</strong> 
    <span contenteditable="true" class="campo-editavel">55.245.737/0001-66</span><br>
    
    <strong>Endereço:</strong> 
    <span contenteditable="true" class="campo-grande">Rua Senador Bernardo Monteiro, 215 C – Benfica – Rio de Janeiro/RJ</span>
  </div>

  <div class="linha"></div>

  <div class="bloco">
    <strong>Descrição do Serviço:</strong><br>
    <span contenteditable="true" class="campo-grande multilinha">Prestação de serviço de transporte rodoviário de cargas, conforme CT-e autorizado pela SEFAZ.</span>
  </div>

  <div class="bloco">
    <strong>CT-e Modelo:</strong> 
    <span contenteditable="true" class="campo-editavel" style="min-width: 50px;">57</span><br>
    
    <strong>Série / Número:</strong> 
    <span contenteditable="true" class="campo-editavel">001 / 18</span><br>
    
    <strong>Chave de Acesso:</strong><br>
    <span contenteditable="true" class="campo-grande">33251232243464000115570010000000181287071608</span>
  </div>

  <div class="linha"></div>

  <div class="bloco">
    <strong>Data da Prestação:</strong> 
    <span id="dataPrestacao" contenteditable="true" class="campo-editavel">26/12/2025</span><br>
    
    <strong>Valor do Serviço:</strong>
    <span id="valorServico" contenteditable="true" class="campo-editavel valor">R$ 1.700,00</span>
  </div>

  <div class="bloco">
    <strong>Forma de Pagamento:</strong> 
    <span contenteditable="true" class="campo-editavel">A combinar</span><br>
    
    <strong>Valor Total Recebido:</strong>
    <span id="valorRecebido" contenteditable="true" class="campo-editavel valor">R$ 1.700,00</span>
  </div>

  <div class="linha"></div>

  <div class="bloco">
    <span contenteditable="true" class="campo-grande multilinha">
      Declaramos para os devidos fins que o valor acima refere-se à prestação de serviço de transporte,
      estando este recibo vinculado ao CT-e autorizado em 26/12/2025 às 10:01:39.
    </span>
  </div>

  <div class="assinatura">
    <div style="height: 40px; border-bottom: 1px solid #000; width: 80%; margin: 0 auto 10px auto;"></div>
    <span contenteditable="true" class="campo-editavel" style="min-width: 250px;">ImperiLog Transportes LTDA</span>
  </div>

  <div class="rodape">
    <span contenteditable="true" class="campo-editavel" style="min-width: 400px; display: inline-block;">
      Documento gerado eletronicamente. Dispensa assinatura física.
    </span>
  </div>

</div>

<script>
  document.addEventListener('DOMContentLoaded', function() {
    // Botão para atualizar data
    document.getElementById('btnAtualizarData').addEventListener('click', function() {
      const hoje = new Date();
      const dia = String(hoje.getDate()).padStart(2, '0');
      const mes = String(hoje.getMonth() + 1).padStart(2, '0');
      const ano = hoje.getFullYear();
      const dataFormatada = \`\${dia}/\${mes}/\${ano}\`;
      
      document.getElementById('dataPrestacao').textContent = dataFormatada;
      
      // Também atualiza a data na declaração
      const declaracao = document.querySelector('.campo-grande.multilinha:last-of-type');
      const textoDeclaracao = declaracao.textContent;
      const novoTexto = textoDeclaracao.replace(/\\d{2}\/\\d{2}\/\\d{4}/g, dataFormatada);
      declaracao.textContent = novoTexto;
      
      alert('Data atualizada para ' + dataFormatada);
    });
    
    // Botão para imprimir
    document.getElementById('btnImprimir').addEventListener('click', function() {
      window.print();
    });
    
    // Botão para limpar campos
    document.getElementById('btnLimpar').addEventListener('click', function() {
      if (confirm('Tem certeza que deseja limpar todos os campos editáveis? Isso apagará todos os dados personalizados.')) {
        const camposEditaveis = document.querySelectorAll('[contenteditable="true"]');
        
        camposEditaveis.forEach(campo => {
          if (campo.id === 'dataPrestacao') {
            campo.textContent = '26/12/2025';
          } else if (campo.id === 'valorServico') {
            campo.textContent = 'R$ 1.700,00';
          } else if (campo.id === 'valorRecebido') {
            campo.textContent = 'R$ 1.700,00';
          } else if (campo.classList.contains('multilinha') && campo.textContent.includes('Declaramos')) {
            campo.textContent = 'Declaramos para os devidos fins que o valor acima refere-se à prestação de serviço de transporte, estando este recibo vinculado ao CT-e autorizado em 26/12/2025 às 10:01:39.';
          } else if (campo.textContent === 'RECIBO DE PRESTAÇÃO DE SERVIÇO') {
            // Mantém o título principal
          } else if (campo.textContent === 'Serviço de Transporte Rodoviário') {
            // Mantém o subtítulo
          } else if (campo.textContent === 'ImperiLog Transportes LTDA') {
            // Mantém o nome da empresa
          } else {
            campo.textContent = '';
          }
        });
        
        alert('Campos limpos. Os valores principais foram restaurados.');
      }
    });
    
    // Atalho de teclado Ctrl+P para imprimir
    document.addEventListener('keydown', function(e) {
      if (e.ctrlKey && e.key === 'p') {
        e.preventDefault();
        window.print();
      }
    });
    
    // Sincroniza os valores se forem iguais
    const valorServico = document.getElementById('valorServico');
    const valorRecebido = document.getElementById('valorRecebido');
    
    function sincronizarValores() {
      if (valorServico.textContent === valorRecebido.textContent) {
        // Se um for alterado, atualiza o outro se estiverem iguais
        valorServico.addEventListener('input', function() {
          valorRecebido.textContent = this.textContent;
        });
        
        valorRecebido.addEventListener('input', function() {
          valorServico.textContent = this.textContent;
        });
      }
    }
    
    sincronizarValores();
  });
</script>

</body>
</html>
    `;

    const generalReceiptDoc = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title>Recibo - Gerador</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        @page {
            size: A4 portrait;
            margin: 20mm;
        }

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            font-size: 14px;
            color: #333;
            background-color: #f5f7fa;
            padding: 20px;
            line-height: 1.5;
        }

        .container {
            max-width: 900px;
            margin: 0 auto;
        }

        .header-page {
            text-align: center;
            margin-bottom: 25px;
            padding-bottom: 15px;
            border-bottom: 2px solid #4a6fa5;
        }

        .header-page h1 {
            color: #2c3e50;
            font-size: 28px;
        }

        .subtitle {
            color: #7f8c8d;
            font-size: 16px;
        }

        .content-wrapper {
            display: flex;
            flex-wrap: wrap;
            gap: 30px;
            margin-bottom: 30px;
        }

        .form-section {
            flex: 1;
            min-width: 300px;
            background-color: white;
            padding: 25px;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
        }

        .recibo-section {
            flex: 1;
            min-width: 300px;
        }

        .form-group {
            margin-bottom: 20px;
        }

        .form-group label {
            display: block;
            margin-bottom: 8px;
            font-weight: 600;
            color: #2c3e50;
        }

        .form-control {
            width: 100%;
            padding: 12px;
            border: 1px solid #ddd;
            border-radius: 5px;
            font-size: 14px;
            transition: border 0.3s;
        }

        .form-control:focus {
            border-color: #4a6fa5;
            outline: none;
        }

        .payment-options {
            display: flex;
            flex-wrap: wrap;
            gap: 15px;
            margin-top: 8px;
        }

        .payment-option {
            display: flex;
            align-items: center;
        }

        .payment-option input {
            margin-right: 8px;
        }

        .btn {
            background-color: #4a6fa5;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 5px;
            font-size: 16px;
            cursor: pointer;
            transition: background-color 0.3s;
            font-weight: 600;
        }

        .btn:hover {
            background-color: #3a5985;
        }

        .btn-print {
            background-color: #27ae60;
            margin-left: 10px;
        }

        .btn-print:hover {
            background-color: #219653;
        }

        .recibo {
            border: 2px solid #2c3e50;
            padding: 20px;
            background-color: white;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
            border-radius: 5px;
        }

        .recibo-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 1px solid #ddd;
        }

        .recibo-header h1 {
            margin: 0;
            font-size: 28px;
            letter-spacing: 2px;
            color: #2c3e50;
        }

        .recibo-numero {
            font-size: 16px;
            font-weight: bold;
        }

        .box {
            border: 1px solid #555;
            padding: 12px;
            margin-bottom: 15px;
            border-radius: 4px;
        }

        .box strong {
            display: block;
            margin-bottom: 6px;
            font-size: 15px;
        }

        .linha {
            margin-bottom: 12px;
        }

        .valor {
            font-size: 20px;
            font-weight: bold;
            color: #27ae60;
            margin: 15px 0;
        }

        .pagamento {
            padding: 8px 0;
        }

        .pagamento label {
            margin-right: 20px;
            cursor: pointer;
        }

        .pagamento input {
            margin-right: 5px;
        }

        .assinatura {
            margin-top: 50px;
            display: flex;
            justify-content: space-between;
        }

        .assinatura div {
            width: 45%;
            text-align: center;
        }

        .assinatura hr {
            margin-top: 50px;
            border: none;
            border-top: 1px solid #333;
        }

        .barcode {
            margin-top: 30px;
            text-align: center;
            letter-spacing: 3px;
            font-size: 16px;
            padding: 10px;
            border-top: 1px dashed #ccc;
            color: #555;
        }

        .actions {
            text-align: center;
            margin-top: 25px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
        }

        .hidden {
            display: none;
        }

        @media print {
            body {
                background-color: white;
                padding: 0;
            }
            
            .form-section, .header-page, .actions {
                display: none;
            }
            
            .recibo {
                border: 2px solid #000;
                box-shadow: none;
                margin: 0;
                padding: 15px;
            }
            
            .content-wrapper {
                display: block;
                margin: 0;
            }
            
            .recibo-section {
                width: 100%;
            }
        }

        @media (max-width: 768px) {
            .content-wrapper {
                flex-direction: column;
            }
            
            .form-section, .recibo-section {
                width: 100%;
            }
            
            .assinatura {
                flex-direction: column;
                gap: 30px;
            }
            
            .assinatura div {
                width: 100%;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <header class="header-page">
            <h1>Gerador de Recibos</h1>
            <p class="subtitle">Preencha os dados abaixo para gerar seu recibo</p>
        </header>
        
        <div class="content-wrapper">
            <section class="form-section">
                <form id="reciboForm">
                    <div class="form-group">
                        <label for="pagador">Nome do Pagador / Empresa</label>
                        <input type="text" id="pagador" class="form-control" value="SLM TECNOLOGIA E VENDA DW PRODUTOS">
                    </div>
                    
                    <div class="form-group">
                        <label for="cnpj">CNPJ / CPF</label>
                        <input type="text" id="cnpj" class="form-control" value="10.129.772/0001-09">
                    </div>
                    
                    <div class="form-group">
                        <label for="valor">Valor (R$)</label>
                        <input type="text" id="valor" class="form-control" value="2.200,00">
                    </div>
                    
                    <div class="form-group">
                        <label for="valorExtenso">Valor por Extenso</label>
                        <input type="text" id="valorExtenso" class="form-control" value="Dois mil e duzentos reais">
                    </div>
                    
                    <div class="form-group">
                        <label for="referente">Referente a</label>
                        <input type="text" id="referente" class="form-control" value="Serviços prestados">
                    </div>
                    
                    <div class="form-group">
                        <label>Forma de Pagamento</label>
                        <div class="payment-options">
                            <div class="payment-option">
                                <input type="radio" id="dinheiro" name="pagamento" value="dinheiro">
                                <label for="dinheiro">Dinheiro</label>
                            </div>
                            <div class="payment-option">
                                <input type="radio" id="pix" name="pagamento" value="pix">
                                <label for="pix">Pix</label>
                            </div>
                            <div class="payment-option">
                                <input type="radio" id="transferencia" name="pagamento" checked value="transferencia">
                                <label for="transferencia">Transferência</label>
                            </div>
                            <div class="payment-option">
                                <input type="radio" id="cartao" name="pagamento" value="cartao">
                                <label for="cartao">Cartão</label>
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="recebedor">Nome do Recebedor</label>
                        <input type="text" id="recebedor" class="form-control" value="MEIR">
                    </div>
                    
                    <div class="form-group">
                        <label for="numeroRecibo">Número do Recibo</label>
                        <input type="text" id="numeroRecibo" class="form-control" value="0001">
                    </div>
                    
                    <div class="form-group">
                        <label for="data">Data</label>
                        <input type="date" id="data" class="form-control">
                    </div>
                    
                    <div class="actions">
                        <button type="button" id="btnGerar" class="btn">Gerar Recibo</button>
                        <button type="button" id="btnImprimir" class="btn btn-print">Imprimir Recibo</button>
                    </div>
                </form>
            </section>
            
            <section class="recibo-section">
                <div class="recibo" id="reciboOutput">
                    <div class="recibo-header">
                        <h1>RECIBO</h1>
                        <div class="recibo-numero"><strong>Nº:</strong> <span id="outNumero">0001</span></div>
                    </div>

                    <div class="box">
                        <strong>DADOS DO PAGADOR</strong>
                        <span id="outPagador">SLM TECNOLOGIA E VENDA DW PRODUTOS</span><br>
                        CNPJ/CPF: <span id="outCnpj">10.129.772/0001-09</span>
                    </div>

                    <div class="linha valor">
                        VALOR: R$ <span id="outValor">2.200,00</span> (<span id="outValorExtenso">Dois mil e duzentos reais</span>)
                    </div>

                    <div class="linha">
                        Recebi de <strong id="outPagador2">SLM TECNOLOGIA E VENDA DW PRODUTOS</strong>, a quantia de
                        <strong>R$ <span id="outValor2">2.200,00</span> (<span id="outValorExtenso2">Dois mil e duzentos reais</span>)</strong>,
                        referente a <strong id="outReferente">Serviços prestados</strong>.
                    </div>

                    <div class="box pagamento">
                        <strong>FORMA DE PAGAMENTO</strong><br>
                        <label><input type="radio" name="outPagamento" disabled> Dinheiro</label>
                        <label><input type="radio" name="outPagamento" disabled> Pix</label>
                        <label><input type="radio" name="outPagamento" disabled checked> Transferência</label>
                        <label><input type="radio" name="outPagamento" disabled> Cartão</label>
                    </div>

                    <div class="linha">
                        <strong>Local e Data:</strong> <span id="outData">_________________________________</span>
                    </div>

                    <div class="assinatura">
                        <div>
                            <hr>
                            <strong>Recebedor</strong><br>
                            <span id="outRecebedor">MEIR</span><br>
                            CPF/CNPJ: ____________________
                        </div>

                        <div>
                            <hr>
                            <strong>Assinatura</strong>
                        </div>
                    </div>

                    <div class="barcode">
                        ||| |||| ||| |||| ||| |||| |||
                    </div>
                </div>
            </section>
        </div>
    </div>

    <script>
        document.addEventListener('DOMContentLoaded', function() {
            // Definir data atual
            const today = new Date();
            const formattedDate = today.toISOString().split('T')[0];
            document.getElementById('data').value = formattedDate;
            
            // Atualizar data no recibo
            const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
            document.getElementById('outData').textContent = \`São Paulo, \${today.toLocaleDateString('pt-BR', options)}\`;
            
            // Botão para gerar recibo
            document.getElementById('btnGerar').addEventListener('click', function() {
                atualizarRecibo();
            });
            
            // Botão para imprimir
            document.getElementById('btnImprimir').addEventListener('click', function() {
                window.print();
            });
            
            // Atualizar recibo quando os campos do formulário mudam
            const formInputs = document.querySelectorAll('#reciboForm input');
            formInputs.forEach(input => {
                input.addEventListener('input', atualizarRecibo);
                if (input.type === 'radio') {
                    input.addEventListener('change', atualizarRecibo);
                }
            });
            
            // Função para formatar valor monetário
            function formatarValor(valor) {
                // Remove qualquer caractere que não seja número
                let numeros = valor.replace(/\\D/g, '');
                
                // Se não houver números, retorna "0,00"
                if (numeros === '') return '0,00';
                
                // Converte para número e formata com 2 casas decimais
                let valorNumerico = parseInt(numeros) / 100;
                
                // Formata para o padrão brasileiro
                return valorNumerico.toLocaleString('pt-BR', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                });
            }
            
            // Função para atualizar o recibo
            function atualizarRecibo() {
                // Obter valores do formulário
                const pagador = document.getElementById('pagador').value;
                const cnpj = document.getElementById('cnpj').value;
                const valor = formatarValor(document.getElementById('valor').value);
                const valorExtenso = document.getElementById('valorExtenso').value;
                const referente = document.getElementById('referente').value;
                const recebedor = document.getElementById('recebedor').value;
                const numeroRecibo = document.getElementById('numeroRecibo').value;
                
                // Obter forma de pagamento selecionada
                const pagamentoSelecionado = document.querySelector('input[name="pagamento"]:checked').value;
                
                // Obter data
                const dataInput = document.getElementById('data').value;
                let dataFormatada = '_________________________________';
                if (dataInput) {
                    const data = new Date(dataInput);
                    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
                    dataFormatada = \`São Paulo, \${data.toLocaleDateString('pt-BR', options)}\`;
                }
                
                // Atualizar elementos do recibo
                document.getElementById('outPagador').textContent = pagador;
                document.getElementById('outPagador2').textContent = pagador;
                document.getElementById('outCnpj').textContent = cnpj;
                document.getElementById('outValor').textContent = valor;
                document.getElementById('outValor2').textContent = valor;
                document.getElementById('outValorExtenso').textContent = valorExtenso;
                document.getElementById('outValorExtenso2').textContent = valorExtenso;
                document.getElementById('outReferente').textContent = referente;
                document.getElementById('outRecebedor').textContent = recebedor;
                document.getElementById('outNumero').textContent = numeroRecibo;
                document.getElementById('outData').textContent = dataFormatada;
                
                // Atualizar forma de pagamento no recibo
                const pagamentoOptions = document.querySelectorAll('.pagamento input[type="radio"]');
                pagamentoOptions.forEach(option => {
                    option.checked = false;
                });
                
                switch(pagamentoSelecionado) {
                    case 'dinheiro':
                        pagamentoOptions[0].checked = true;
                        break;
                    case 'pix':
                        pagamentoOptions[1].checked = true;
                        break;
                    case 'transferencia':
                        pagamentoOptions[2].checked = true;
                        break;
                    case 'cartao':
                        pagamentoOptions[3].checked = true;
                        break;
                }
                
                // Atualizar código de barras (simulação)
                atualizarCodigoBarras();
            }
            
            // Função para atualizar código de barras (simulação)
            function atualizarCodigoBarras() {
                const numeroRecibo = document.getElementById('numeroRecibo').value.padStart(4, '0');
                const valor = document.getElementById('valor').value.replace(/\\D/g, '').padStart(10, '0');
                const data = document.getElementById('data').value.replace(/-/g, '');
                
                // Cria um código simples para o código de barras simulado
                let barcode = \`||| \${numeroRecibo} ||| \${valor.substring(0, 4)} ||| \${valor.substring(4, 8)} ||| \${data.substring(0, 4)} |||\`;
                
                document.querySelector('.barcode').innerHTML = barcode;
            }
            
            // Inicializar recibo com valores padrão
            atualizarRecibo();
            
            // Formatação automática do campo de valor
            document.getElementById('valor').addEventListener('input', function(e) {
                let value = e.target.value;
                
                // Remove todos os caracteres não numéricos
                value = value.replace(/\\D/g, '');
                
                // Se houver valor, formata como moeda
                if (value.length > 0) {
                    // Converte para número e divide por 100 para obter os centavos
                    const numericValue = parseInt(value) / 100;
                    
                    // Formata como moeda brasileira
                    e.target.value = numericValue.toLocaleString('pt-BR', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    });
                }
            });
        });
    </script>
</body>
</html>
    `;

    return (
        <div className="flex-1 flex flex-col bg-[#05070a] overflow-hidden animate-fade-in h-[calc(100vh-80px)]">
            <header className="px-10 py-5 bg-bg-card/30 backdrop-blur-md border-b border-border-color/30 flex flex-col md:flex-row items-center justify-between gap-4 shrink-0">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-secondary/10 border border-secondary/20 flex items-center justify-center text-secondary shadow-[0_0_20px_rgba(59,130,246,0.15)]">
                        <i className="fas fa-print text-xl"></i>
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-light tracking-tight uppercase">Documentos de <span className="text-secondary">Impressão</span></h2>
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Operational Document Hub v1.0</span>
                    </div>
                </div>

                <div className="flex bg-bg-main p-1 rounded-xl border border-border-color/50">
                    <button 
                        onClick={() => setActiveDoc('transport')} 
                        className={`px-6 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeDoc === 'transport' ? 'bg-secondary text-white shadow-lg' : 'text-gray-500 hover:text-light'}`}
                    >
                        <i className="fas fa-truck mr-2"></i> Recibo Transporte
                    </button>
                    <button 
                        onClick={() => setActiveDoc('generator')} 
                        className={`px-6 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeDoc === 'generator' ? 'bg-secondary text-white shadow-lg' : 'text-gray-500 hover:text-light'}`}
                    >
                        <i className="fas fa-file-invoice mr-2"></i> Gerador Geral
                    </button>
                </div>
            </header>

            <div className="flex-1 relative bg-white">
                <iframe
                    title="Doc Preview"
                    srcDoc={activeDoc === 'transport' ? transportReceiptDoc : generalReceiptDoc}
                    className="w-full h-full border-none"
                    sandbox="allow-scripts allow-same-origin allow-modals allow-popups"
                />
            </div>

            <footer className="px-10 py-4 bg-bg-card/20 border-t border-border-color/10 flex flex-col md:flex-row items-center justify-between gap-2 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-success animate-pulse"></div>
                    <p className="text-[11px] font-black text-light uppercase tracking-widest">
                        IMPÉRIO ECO LOG - <span className="text-gray-500 font-bold">CNPJ 32.243.464/0001-15</span>
                    </p>
                </div>
                <p className="text-[11px] font-bold text-gray-600 uppercase tracking-tighter">
                    AV BRASIL 2520 - BENFICA • RIO DE JANEIRO/RJ
                </p>
            </footer>
        </div>
    );
};

export default PrintingDocuments;
