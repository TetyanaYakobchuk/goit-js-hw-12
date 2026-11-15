import axios from 'axios';

const BASE_URL = 'https://pixabay.com/api/';
const API_KEY = import.meta.env.VITE_PIXABAY_API_KEY;
//58453364-6b9652d64146c8ee0a8025af6
console.log('API key loaded:', Boolean(API_KEY));


export async function getImagesByQuery(query, page) {
  if (!API_KEY) {
    throw new Error(
      'Pixabay API key is missing. Add VITE_PIXABAY_API_KEY to the .env file.',
    );
  }

  const response = await axios.get(BASE_URL, {
    params: {
      key: API_KEY,
      q: query,
      image_type: 'photo',
      orientation: 'horizontal',
      safesearch: true,
      page,
      per_page: 15,
    },
  });

  return response.data;
}