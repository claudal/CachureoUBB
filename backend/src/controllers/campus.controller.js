import * as services from '../services/campus.services.js';

export const getCampuses = async (req, res) => {
  try {
    res.json(await services.listar());
  } catch (err) {
    console.error('Error fetching public objects:', err);
  }
}