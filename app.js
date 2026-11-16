// 1. Configuração das chaves
const SUPABASE_URL = 'https://udmogmypguwszgnxuyys.supabase.co';
// ATENÇÃO: Cole aqui a chave que começa com "sb_publishable_..."
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_nxP2KnttwCmuNIm0ObEqRQ_Q9zdy0a_'; 

// 2. Criação do cliente (renomeado para evitar conflito)
// O objeto global 'supabase' é criado pelo CDN. Usamos ele para criar nosso cliente.
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

// 3. Lógica de Login
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const ci = document.getElementById('user').value.trim();
    const password = document.getElementById('pass').value;
    const btn = document.getElementById('acceder');

    // Validação básica
    if (!ci || !password) {
        Swal.fire('Error', 'Por favor, complete todos los campos.', 'error');
        return;
    }

    // O Supabase exige e-mail. Criamos um e-mail fictício usando o CI.
    const emailFicticio = ci.includes('@') ? ci : `${ci}@upap.edu.py`;

    // Estado de carregamento no botão
    btn.innerHTML = '<i class="mdi mdi-loading mdi-spin"></i> Accediendo...';
    btn.disabled = true;

    try {
        // 4. Chamada de Login usando 'supabaseClient'
        const { data: authData, error: authError } = await supabaseClient.auth.signInWithPassword({
            email: emailFicticio,
            password: password
        });

        if (authError) throw authError;

        // 5. Buscar o papel (role) do usuário
        const { data: profile, error: profileError } = await supabaseClient
            .from('profiles')
            .select('role')
            .eq('id', authData.user.id)
            .single();

        if (profileError) throw profileError;

        // 6. Redirecionamento
        if (profile.role === 'alumno') {
            window.location.href = 'alumno.html';
        } else if (profile.role === 'secretaria') {
            window.location.href = 'secretaria.html';
        } else {
            Swal.fire('Atención', 'Rol no reconocido.', 'warning');
            btn.innerHTML = '<i class="mdi mdi-login"></i> Acceder';
            btn.disabled = false;
        }

    } catch (error) {
    console.error("Erro no login:", error); 
    
    let mensagem = error.message;
    
    if (mensagem === 'Invalid login credentials') {
        mensagem = 'N° de CI o contraseña incorrectos.';
    } else if (mensagem === 'Failed to fetch') {
        // Mensagem mais amigável para erro de rede
        mensagem = 'Erro de conexão. Verifique sua internet ou desative bloqueadores de anúncios e tente novamente.';
    }
    
    Swal.fire('Error de Acceso', mensagem, 'error');
    
    btn.innerHTML = '<i class="mdi mdi-login"></i> Acceder';
    btn.disabled = false;
}
});