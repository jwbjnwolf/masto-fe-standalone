const initialState = localStorage.getItem('initial-state');
if (!initialState) {
  window.location.href = '/login.html';
} else {
  document.getElementById('initial-state').textContent = initialState;
}