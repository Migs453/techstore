const API_URL = 'http://localhost:3000/usuarios';

const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value.trim();
    const senha = document.getElementById('senha').value.trim();

    try {
      const response = await fetch(API_URL);
      const usuarios = await response.json();

      const usuarioEncontrado = usuarios.find(
        (u) => u.email.toLowerCase() === email.toLowerCase() && u.senha === senha
      );

      if (usuarioEncontrado) {
        localStorage.setItem('usuarioLogado', JSON.stringify(usuarioEncontrado));
        alert(`Login efetuado com sucesso! Bem-vindo(a), ${usuarioEncontrado.nome}.`);

        if (usuarioEncontrado.email === 'admin@techstore.com' || usuarioEncontrado.perfil === 'admin') {
          window.location.href = 'admin.html';
        } else {
          window.location.href = 'boas_vindas.html';
        }
      } else {
        alert('E-mail ou senha incorretos.');
      }
    } catch (error) {
      alert('Erro de conexão com a API. Verifique se o json-server está rodando.');
    }
  });
}

// ==========================================================================
// 2. PÁGINA DE CADASTRO (POST)
// ==========================================================================
const cadastroForm = document.getElementById('cadastroForm');
if (cadastroForm) {
  cadastroForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const novoUsuario = {
      nome: document.getElementById('nome').value.trim(),
      sobrenome: document.getElementById('sobrenome').value.trim(),
      cpf: document.getElementById('cpf').value.trim(),
      telefone: document.getElementById('telefone').value.trim(),
      email: document.getElementById('email').value.trim(),
      senha: document.getElementById('senha').value.trim(),
      cep: document.getElementById('cep').value.trim(),
      rua: document.getElementById('rua').value.trim(),
      cidade: document.getElementById('cidade').value.trim(),
      estado: document.getElementById('estado').value.trim().toUpperCase(),
      perfil: 'user'
    };

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(novoUsuario)
      });

      if (response.ok) {
        alert('Cadastro realizado com sucesso! Faça login para continuar.');
        window.location.href = 'index.html';
      }
    } catch (error) {
      alert('Erro ao cadastrar usuário na API.');
    }
  });
}

// ==========================================================================
// 3. PÁGINA ADMIN (GET, PUT, DELETE, BUSCA CPF)
// ==========================================================================
function verificarAcessoAdmin() {
  const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));

  if (!usuarioLogado) {
    alert('Você precisa fazer login para acessar esta página!');
    window.location.href = 'index.html';
    return;
  }

  if (usuarioLogado.email !== 'admin@techstore.com' && usuarioLogado.perfil !== 'admin') {
    alert('Acesso restrito para administradores.');
    window.location.href = 'boas_vindas.html';
  }
}

async function carregarUsuarios() {
  const tabela = document.getElementById('tabelaUsuarios');
  if (!tabela) return;

  try {
    const response = await fetch(API_URL);
    const usuarios = await response.json();
    renderizarTabela(usuarios);
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
  }
}

function renderizarTabela(usuarios) {
  const tabela = document.getElementById('tabelaUsuarios');
  if (!tabela) return;
  tabela.innerHTML = '';

  if (usuarios.length === 0) {
    tabela.innerHTML = '<tr><td colspan="6" style="text-align:center;">Nenhum usuário encontrado.</td></tr>';
    return;
  }

  usuarios.forEach(user => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${user.nome} ${user.sobrenome}</td>
      <td>${user.cpf}</td>
      <td>${user.email}</td>
      <td>${user.cidade}/${user.estado}</td>
      <td>${user.telefone}</td>
      <td class="actions-cell">
        <button class="btn-warning" onclick="abrirEdicao('${user.id}')">Editar</button>
        <button class="btn-danger" onclick="deletarUsuario('${user.id}')">Excluir</button>
      </td>
    `;
    tabela.appendChild(tr);
  });
}

async function buscarPorCpf() {
  const cpfBusca = document.getElementById('searchCpf').value.trim();
  if (!cpfBusca) return carregarUsuarios();

  try {
    const response = await fetch(`${API_URL}?cpf=${encodeURIComponent(cpfBusca)}`);
    const usuarios = await response.json();
    renderizarTabela(usuarios);
  } catch (error) {
    alert('Erro ao buscar CPF.');
  }
}

async function abrirEdicao(id) {
  try {
    const response = await fetch(`${API_URL}/${id}`);
    const user = await response.json();

    document.getElementById('editId').value = user.id;
    document.getElementById('editNome').value = user.nome;
    document.getElementById('editSobrenome').value = user.sobrenome;
    document.getElementById('editCpf').value = user.cpf;
    document.getElementById('editTelefone').value = user.telefone;
    document.getElementById('editEmail').value = user.email;
    document.getElementById('editSenha').value = user.senha;
    document.getElementById('editCep').value = user.cep;
    document.getElementById('editRua').value = user.rua;
    document.getElementById('editCidade').value = user.cidade;
    document.getElementById('editEstado').value = user.estado;

    const editCard = document.getElementById('editCard');
    editCard.style.display = 'block';
    editCard.scrollIntoView({ behavior: 'smooth' });
  } catch (error) {
    alert('Erro ao carregar dados do usuário.');
  }
}

function fecharEdicao() {
  const editCard = document.getElementById('editCard');
  if (editCard) editCard.style.display = 'none';
}

const editForm = document.getElementById('editForm');
if (editForm) {
  editForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('editId').value;

    const usuarioAtualizado = {
      nome: document.getElementById('editNome').value.trim(),
      sobrenome: document.getElementById('editSobrenome').value.trim(),
      cpf: document.getElementById('editCpf').value.trim(),
      telefone: document.getElementById('editTelefone').value.trim(),
      email: document.getElementById('editEmail').value.trim(),
      senha: document.getElementById('editSenha').value.trim(),
      cep: document.getElementById('editCep').value.trim(),
      rua: document.getElementById('editRua').value.trim(),
      cidade: document.getElementById('editCidade').value.trim(),
      estado: document.getElementById('editEstado').value.trim().toUpperCase()
    };

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(usuarioAtualizado)
      });

      if (response.ok) {
        alert('Usuário atualizado com sucesso!');
        fecharEdicao();
        carregarUsuarios();
      }
    } catch (error) {
      alert('Erro ao atualizar usuário.');
    }
  });
}

async function deletarUsuario(id) {
  if (confirm('Tem certeza que deseja excluir este usuário?')) {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        alert('Usuário excluído!');
        carregarUsuarios();
      }
    } catch (error) {
      alert('Erro ao excluir usuário.');
    }
  }
}

// ==========================================================================
// 4. FUNÇÕES GERAIS (CARRINHO & LOGOUT)
// ==========================================================================
function adicionarAoCarrinho(produto) {
  alert(`O item "${produto}" foi adicionado ao seu carrinho!`);
}

function fazerLogout() {
  localStorage.removeItem('usuarioLogado');
  window.location.href = 'index.html';
}
