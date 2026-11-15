import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';

import { getImagesByQuery } from './js/pixabay-api.js';
import {
  clearGallery,
  createGallery,
  hideLoadMoreButton,
  hideLoader,
  showLoadMoreButton,
  showLoader,
} from './js/render-functions.js';

const searchForm = document.querySelector('.search-form');
const searchInput = document.querySelector('.search-input');
const gallery = document.querySelector('.gallery');
const loadMoreButton = document.querySelector('.load-more-button');

const PER_PAGE = 15;
let currentPage = 1;
let currentQuery = '';
let totalHits = 0;
let isLoading = false;

searchForm.addEventListener('submit', handleSearch);
loadMoreButton.addEventListener('click', handleLoadMore);

async function handleSearch(event) {
  event.preventDefault();

  const query = searchInput.value.trim();
  if (!query) {
    iziToast.warning({
      message: 'Please enter a search term.',
      position: 'topRight',
    });
    return;
  }

  currentQuery = query;
  currentPage = 1;
  totalHits = 0;
  clearGallery();
  hideLoadMoreButton();

  await fetchImages({ isNewSearch: true });
}

async function handleLoadMore() {
  if (isLoading || !currentQuery) return;

  const loadedCount = gallery.children.length;
  if (loadedCount >= totalHits) {
    showEndOfCollectionMessage();
    hideLoadMoreButton();
    return;
  }

  currentPage += 1;
  await fetchImages({ isNewSearch: false });
}

async function fetchImages({ isNewSearch }) {
  if (isLoading) return;

  isLoading = true;
  hideLoadMoreButton();
  showLoader();

  try {
    const data = await getImagesByQuery(currentQuery, currentPage);
    const images = data.hits ?? [];
    totalHits = data.totalHits ?? 0;

    if (images.length === 0 && isNewSearch) {
      iziToast.error({
        message: 'Sorry, there are no images matching your search query. Please try again!',
        position: 'topRight',
      });
      return;
    }

    if (images.length === 0 && !isNewSearch) {
      showEndOfCollectionMessage();
      return;
    }

    createGallery(images);

    const loadedCount = gallery.children.length;
    const maxAvailable = Math.min(totalHits, 500);
    const reachedEnd = loadedCount >= maxAvailable || images.length < PER_PAGE;

    if (reachedEnd) {
      hideLoadMoreButton();
      showEndOfCollectionMessage();
    } else {
      showLoadMoreButton();
    }

    if (!isNewSearch) scrollToNewImages();
  } catch (error) {
    if (!isNewSearch && currentPage > 1) currentPage -= 1;

    iziToast.error({
      message:
        error.response?.data?.message ||
        'Something went wrong. Please try again later.',
      position: 'topRight',
    });
  } finally {
    hideLoader();
    isLoading = false;
  }
}

function showEndOfCollectionMessage() {
  iziToast.info({
    message: "We're sorry, but you've reached the end of search results.",
    position: 'topRight',
    timeout: 5000,
  });
}

function scrollToNewImages() {
  const firstCard = gallery.firstElementChild;
  if (!firstCard) return;

  const { height: cardHeight } = firstCard.getBoundingClientRect();
  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}