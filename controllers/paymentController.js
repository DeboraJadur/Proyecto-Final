const Task = require('../db/models/task.js'); 
const User = require('../db/models/user');
const session = require('express-session');

// Dentro de tu controlador
const displayPayment = async (req, res) => {
  try {
    const data = await Task.findAll();
    
    console.log('Datos obtenidos de la base de datos:', data);
    
    const tareasOrdenadas = data.sort((a, b) => a.date_ini - b.date_ini);
    
    // Formatea las fechas antes de enviarlas a la vista
    const tareasFormateadas = tareasOrdenadas.map(tarea => {
      return {
        ...tarea.dataValues,
        date_ini: new Date(tarea.date_ini).toLocaleDateString(), // Formatea la fecha de inicio
        date_end: new Date(tarea.date_end).toLocaleDateString()  // Formatea la fecha de fin
      };
    });

    res.render('payment', { 
      user: req.session.user || null, 
      tareas: tareasFormateadas 
    });
  } catch (error) {
    console.error('Error al cargar las tareas:', error);
    res.send('Hubo un error al cargar las tareas.');
  }
};

  

  const cambiarTarea = async (req, res) => {
    const tareaId = req.body.id; // ID de la tarea que se va a modificar
    const usuarioId = req.session.usuario.id; // ID del usuario actual
  
    // Verificar si el usuario es el dueño de la tarea
    const tarea = await Task.findOne({
      where: {
        id: tareaId,
        UserId: usuarioId // Asegúrate de que la tarea tenga un campo que relacione al usuario
      }
    });
  
    if (tarea) {
      try {
        // Solicitar el nuevo nombre de la tarea
        const nuevoNombre = req.body.nuevoNombre; 
  
        // Actualizar el nombre de la tarea en la base de datos
        await Task.update(
          { name: nuevoNombre },
          { where: { id: tareaId } }
        );
  
        res.json({ success: true }); 
      } catch (error) {
        console.error('Error al cambiar el nombre de la tarea:', error);
        res.json({ success: false }); 
      }
    } else {
      res.json({ success: false }); 
    }
  };

 const createTask = async (req, res) => {
    const { date_ini, date_end, descrip, userId } = req.body;

    // Verifica que req.body esté recibiendo los datos correctamente
    console.log('Datos recibidos en req.body:', { date_ini, date_end, descrip , userId });

    // Validar que todos los campos estén presentes
    if (!date_ini || !date_end || !descrip || !userId) {
        console.log('Faltan datos en el formulario o en la sesión');
    }

    // Crear la tarea y asociarla con el usuario
    try {
        const newTask = await Task.create({
            date_ini,
            date_end,
            descrip,
            UserId: userId  
        });

        // Verifica si la tarea fue creada con éxito
        console.log('Tarea creada con éxito:', newTask);

        res.redirect('/payment');
    } catch (error) {
        console.error('Error al crear tarea:', error);
        res.render('/payment', {
        });
    }
}

const eliminarTarea = async (req, res) => {
    const tareaId = req.body.id; 
    const usuarioId = req.session.usuario.id; 

    // Verificar si el usuario es el dueño de la tarea
    const tarea = await Task.findOne({
        where: {
            id: tareaId,
            UserId: usuarioId 
        }
    });

    if (tarea) {
        try {
            // Eliminar la tarea de la base de datos
            await Task.destroy({
                where: { id: tareaId }
            });

            res.json({ success: true }); 
        } catch (error) {
            console.error('Error al eliminar la tarea:', error);
            res.json({ success: false }); 
        }
    } else {
        res.json({ success: false }); 
    }
}


module.exports = {
    displayPayment,
    createTask,
    cambiarTarea,
    eliminarTarea
}

