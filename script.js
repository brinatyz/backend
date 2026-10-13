
const API_URL = 'http://localhost:3000/api/alunos';

const form = document.getElementById('aluno-Form');
const tbody = document.getElementById('alunos-tbody');
const btnCancel = document.getElementById('btn-cancel');
const btnSave = document.getElementById('btn-save');

const inputid = document.getElementById('aluno-id');
const inputNome = document.getElementById('nome');
const inputEmail = document.getElementById('email');
const inputCurso = document.getElementById('curso');
const inputCPF = document.getElementById('cpf');
const inputTelefone = document.getElementById('telefone');

let editandoId = null;


// ======================================
// BUSCAR ALUNOS
// ======================================

async function buscarAlunos() {

    console.log('Buscando alunos...');

    try {

        const response = await fetch(API_URL);

        console.log('Status da resposta:', response.status);

        if (!response.ok) {

            throw new Error(
                `Erro HTTP: ${response.status}`
            );

        }

        const alunos = await response.json();

        console.log('Dados recebidos:', alunos);

        tbody.innerHTML = '';

        if (alunos.length === 0) {

            tbody.innerHTML = `
                <tr>
                    <td colspan="7">
                        Nenhum aluno cadastrado
                    </td>
                </tr>
            `;

            return;
        }

        alunos.forEach(aluno => {

            const tr = document.createElement('tr');

            tr.innerHTML = `
                <td>${aluno.id}</td>

                <td>${aluno.nome}</td>

                <td>${aluno.email}</td>

                <td>${aluno.cpf || ''}</td>

                <td>${aluno.telefone || ''}</td>

                <td>${aluno.curso}</td>

                <td class="actions">

                    <button
                        class="btn-icon btn-edit"
                        onclick="iniciarEdicao(${aluno.id})">
                        Editar
                    </button>

                    <button
                        class="btn-icon btn-delete"
                        onclick="deletarAluno(${aluno.id})">
                        Excluir
                    </button>

                </td>
            `;

            tbody.appendChild(tr);

        });

    } catch (error) {

        console.error(
            'ERRO AO BUSCAR ALUNOS:',
            error
        );

        alert(
            'Não foi possível conectar com o servidor.'
        );

    }

}


// ======================================
// SALVAR ALUNO
// ======================================

form.addEventListener('submit', async (event) => {

    event.preventDefault();

    const aluno = {

        nome: inputNome.value.trim(),

        email: inputEmail.value.trim(),

        cpf: inputCPF.value.trim(),

        telefone: inputTelefone.value.trim(),

        curso: inputCurso.value

    };

    console.log('Enviando aluno:', aluno);

    try {

        let response;

        if (editandoId) {

            response = await fetch(
                `${API_URL}/${editandoId}`,
                {
                    method: 'PUT',

                    headers: {
                        'Content-Type': 'application/json'
                    },

                    body: JSON.stringify(aluno)
                }
            );

        } else {

            response = await fetch(
                API_URL,
                {
                    method: 'POST',

                    headers: {
                        'Content-Type': 'application/json'
                    },

                    body: JSON.stringify(aluno)
                }
            );

        }

        if (!response.ok) {

            const erro = await response.json();

            throw new Error(
                erro.error || 'Erro ao salvar aluno'
            );

        }

        const alunoSalvo = await response.json();

        console.log(
            'Aluno salvo:',
            alunoSalvo
        );

        resetarFormulario();

        await buscarAlunos();

    } catch (error) {

        console.error(
            'ERRO AO SALVAR:',
            error
        );

        alert(
            'Erro ao salvar os dados no servidor.'
        );

    }

});


// ======================================
// EDITAR
// ======================================

async function iniciarEdicao(id) {

    try {

        const response = await fetch(API_URL);

        const alunos = await response.json();

        const aluno = alunos.find(
            a => a.id === id
        );

        if (!aluno) {

            alert('Aluno não encontrado!');

            return;

        }

        inputid.value = aluno.id;

        inputNome.value = aluno.nome;

        inputEmail.value = aluno.email;

        inputCPF.value = aluno.cpf || '';

        inputTelefone.value = aluno.telefone || '';

        inputCurso.value = aluno.curso;

        editandoId = aluno.id;

        btnSave.textContent = 'Atualizar';

        btnCancel.style.display = 'inline-block';

    } catch (error) {

        console.error(
            'Erro ao editar:',
            error
        );

    }

}


// ======================================
// DELETAR
// ======================================

async function deletarAluno(id) {

    const confirmar = confirm(
        'Deseja realmente excluir este aluno?'
    );

    if (!confirmar) {

        return;

    }

    try {

        const response = await fetch(
            `${API_URL}/${id}`,
            {
                method: 'DELETE'
            }
        );

        if (!response.ok) {

            throw new Error(
                'Erro ao excluir aluno'
            );

        }

        await buscarAlunos();

    } catch (error) {

        console.error(
            'Erro ao deletar:',
            error
        );

    }

}


// ======================================
// RESETAR FORMULÁRIO
// ======================================

function resetarFormulario() {

    form.reset();

    inputid.value = '';

    editandoId = null;

    btnSave.textContent = 'Salvar aluno';

    btnCancel.style.display = 'none';

}


// ======================================
// CANCELAR
// ======================================

btnCancel.addEventListener(
    'click',
    resetarFormulario
);


// ======================================
// INICIALIZAR
// ======================================

buscarAlunos();