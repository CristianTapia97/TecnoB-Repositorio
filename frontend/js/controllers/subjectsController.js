/**
*    File        : frontend/js/controllers/subjectsController.js
*    Project     : CRUD PHP
*    Author      : Tecnologías Informáticas B - Facultad de Ingeniería - UNMdP
*    License     : http://www.gnu.org/licenses/gpl.txt  GNU GPL 3.0
*    Date        : Mayo 2025
*    Status      : Prototype
*    Iteration   : 3.0 ( prototype )
*/

import { subjectsAPI } from '../api/subjectsAPI.js';

let currentPage = 1;
let totalPages = 1;
const limit = 5;

document.addEventListener('DOMContentLoaded', () => 
{
    loadSubjects();
    setupSubjectFormHandler();
    setupCancelHandler();
    setupPaginationControls();
});

function setupSubjectFormHandler() 
{
  const form = document.getElementById('subjectForm');
  form.addEventListener('submit', async e => 
  {
        e.preventDefault();
        const subject = 
        {
            id: document.getElementById('subjectId').value.trim(),
            name: document.getElementById('name').value.trim()
        };

        try 
        {
            if (subject.id) 
            {
                await subjectsAPI.update(subject);
            }
            else
            {
                await subjectsAPI.create(subject);
            }
            
            form.reset();
            document.getElementById('subjectId').value = '';
            loadSubjects();
        }
        catch (err)
        {
            console.error(err.message);
        }
  });
}

function setupCancelHandler()
{
    const cancelBtn = document.getElementById('cancelBtn');
    cancelBtn.addEventListener('click', () => 
    {
        document.getElementById('subjectId').value = '';
    });
}
function setupPaginationControls() 
{
    document.getElementById('prevPage').addEventListener('click', () => 
    {
        if (currentPage > 1) 
        {
            currentPage--;
            loadSubjects();
        }
    });

    document.getElementById('nextPage').addEventListener('click', () => 
    {
        if (currentPage < totalPages) 
        {
            currentPage++;
            loadSubjects();
        }
    });

    document.getElementById('resultsPerPage').addEventListener('change', e => 
    {
        currentPage = 1;
        loadSubjects();
    });
}

async function loadSubjects()
{
    try 
    {
        const resPerPage = parseInt(document.getElementById('resultsPerPage').value, 10) || limit;
        const data = await subjectsAPI.fetchPaginated(currentPage, resPerPage);
        console.log(data);
        renderSubjectTable(data.subjects);
        totalPages = Math.ceil(data.total / resPerPage);
        document.getElementById('pageInfo').textContent = `Página ${currentPage} de ${totalPages}`;
    } 
    catch (err) 
    {
        console.error('Error cargando materias:', err.message);
    }
}

function renderSubjectTable(subjects)
{
    const tbody = document.getElementById('subjectTableBody');
    tbody.replaceChildren();

    subjects.forEach(subject =>
    {
        const tr = document.createElement('tr');

        tr.appendChild(createCell(subject.name));
        tr.appendChild(createSubjectActionsCell(subject));

        tbody.appendChild(tr);
    });
}

function createCell(text)
{
    const td = document.createElement('td');
    td.textContent = text;
    return td;
}

function createSubjectActionsCell(subject)
{
    const td = document.createElement('td');

    const editBtn = document.createElement('button');
    editBtn.textContent = 'Editar';
    editBtn.className = 'w3-button w3-blue w3-small';
    editBtn.addEventListener('click', () => 
    {
        document.getElementById('subjectId').value = subject.id;
        document.getElementById('name').value = subject.name;
    });

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Borrar';
    deleteBtn.className = 'w3-button w3-red w3-small w3-margin-left';
    deleteBtn.addEventListener('click', () => confirmDeleteSubject(subject.id));

    td.appendChild(editBtn);
    td.appendChild(deleteBtn);
    return td;
}

async function confirmDeleteSubject(id)
{
    if (!confirm('¿Seguro que deseas borrar esta materia?')) return;

    try
    {
        await subjectsAPI.remove(id);
        loadSubjects();
    }
    catch (err)
    {
        showError(err.message|| 'Error al borrar la materia');
        console.error('Error al borrar materia:', err.message);
    }
}

function showError(message) {

    const modal = document.createElement('div');
    const msg = document.createElement('p');
    const mensaje = document.createElement('div');
    const content = document.createElement('div');
    const header = document.createElement('header');
    const title = document.createElement('h3');

    //Le doy todos los valores al modal que seria la estructura principal
    modal.className = 'w3-modal w3-animate-opacity w3-flex ';
    modal.style.zIndex = '9999';
    modal.style.display = 'block';
    
    // CONTENIDO DEL MENSAJE DEL ERROR (Donde van el mensaje de error, boton y titulo)
    content.className = 'w3-modal-content w3-display-container w3-card-4';
    content.style.maxWidth = '400px';

    // Cabecera del mensaje de error (Incluye solo el titulo)
    header.className = 'w3-container w3-red w3-center';

    // Titulo
    title.textContent = 'Error!';

    // Div Donde van el mensaje y el boton
    mensaje.className = 'w3-container w3-padding-16 w3-light-gray';
    mensaje.style.display = 'flex';
    mensaje.style.flexDirection = 'column';
    mensaje.style.alignItems = 'center';

    //Mensaje de error
    msg.textContent = message;

    //Creo el boton de cerrar
    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'OK';
    closeBtn.className = 'w3-button w3-center w3-round-xlarge w3-white w3-hover-gray w3-margin w3-border';
    closeBtn.addEventListener('click', () => closeError());

    //Armo el bloque
    header.appendChild(title);
    mensaje.appendChild(msg);
    mensaje.appendChild(closeBtn);
    content.appendChild(header);
    content.appendChild(mensaje);

    //Le doy el contenido al modal
    modal.appendChild(content);

    // y por ultimo le doy al body el modal
    document.body.appendChild(modal);

    //Funcion para borrar el mensaje de error
    function closeError() {
        modal.remove();
    }
}
