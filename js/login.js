const $ = s => document.querySelector(s);
const err = msg => { $('#err').textContent = msg || ''; };

if (Auth.supported() && Auth.isLoggedIn()) location.replace('prompts.html');

const firstTime = !Auth.hasAccount();

if (!Auth.supported()) {
  $('#btn').disabled = true;
  err('Seu navegador bloqueou o armazenamento ou a criptografia. Abra o site por https ou em outro navegador.');
} else if (firstTime) {
  $('#sub').textContent = 'Crie seu acesso';
  $('#btn').textContent = 'Criar conta e entrar';
  $('#confirmWrap').classList.remove('hidden');
  $('#firstNote').classList.remove('hidden');
  $('#forgot').classList.add('hidden');
  $('#pass').autocomplete = 'new-password';
} else {
  $('#user').value = Auth.user();
}
($('#user').value ? $('#pass') : $('#user')).focus();

$('#eye').onclick = () => {
  const show = $('#pass').type === 'password';
  $('#pass').type = $('#pass2').type = show ? 'text' : 'password';
};

$('#form').addEventListener('submit', async e => {
  e.preventDefault();
  err('');
  const user = $('#user').value.trim();
  const pass = $('#pass').value;
  const remember = $('#remember').checked;
  if (!user) return err('Digite um usuário.');

  $('#btn').disabled = true;
  try {
    if (firstTime) {
      if (pass.length < 6) return err('A senha precisa ter pelo menos 6 caracteres.');
      if (pass !== $('#pass2').value) return err('As senhas não são iguais.');
      await Auth.register(user, pass);
    }
    if (await Auth.login(user, pass, remember)) {
      location.replace('prompts.html');
    } else {
      err('Usuário ou senha incorretos.');
      $('#pass').select();
    }
  } finally {
    $('#btn').disabled = false;
  }
});

$('#forgot').onclick = () => {
  const ok = confirm(
    'Não dá para recuperar a senha, porque ela só existe neste navegador.\n\n' +
    'Se continuar, a conta E TODOS OS PROMPTS deste navegador serão apagados ' +
    '(você pode depois importar um backup .json, se tiver).\n\nApagar e criar uma conta nova?'
  );
  if (ok) { Auth.resetAccount(); location.reload(); }
};
