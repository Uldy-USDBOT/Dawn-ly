/* ============ SCROLL REVEAL + PROGRESS BAR ============ */
const revealObserver = new IntersectionObserver((entries)=>{
  entries.forEach(entry=>{ if(entry.isIntersecting) entry.target.classList.add('visible'); });
}, { threshold:0.08, rootMargin:'0px 0px -40px 0px' });
document.querySelectorAll('.section-card').forEach(card=> revealObserver.observe(card));

window.addEventListener('scroll', ()=>{
  const bar = document.getElementById('progressBar');
  if(!bar) return;
  const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
  const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
  const scrolled = height > 0 ? (winScroll/height)*100 : 0;
  bar.style.width = scrolled + '%';
});

/* ============ INSTALL TO HOME SCREEN ============ */
(function(){
  const installBtn = document.getElementById('installBtn');
  if(!installBtn) return; // some pages may not include the install button
  const installBtnText = document.getElementById('installBtnText');
  const installNote = document.getElementById('installNote');
  const installModal = document.getElementById('installModal');
  const installModalTitle = document.getElementById('installModalTitle');
  const installModalSteps = document.getElementById('installModalSteps');
  const closeInstallModal = document.getElementById('closeInstallModal');

  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  const ua = window.navigator.userAgent || '';
  const isIOS = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;
  const isAndroid = /Android/.test(ua);
  const isFirefox = /Firefox/.test(ua);
  const isSecureContext = window.isSecureContext;

  let deferredPrompt = null;

  function showModal(title, stepsHtml){
    installModalTitle.textContent = title;
    installModalSteps.innerHTML = stepsHtml;
    installModal.classList.add('open');
  }
  closeInstallModal.addEventListener('click', ()=> installModal.classList.remove('open'));
  installModal.addEventListener('click', (e)=>{ if(e.target === installModal) installModal.classList.remove('open'); });

  if (isStandalone) {
    installBtn.style.display = 'none';
    installNote.textContent = 'الموقع مضاف بالفعل إلى شاشتك، أهلًا بعودتك 🌅';
    return;
  }
  installBtn.style.display = 'inline-flex';

  if (!isSecureContext) {
    installBtn.addEventListener('click', ()=>{
      showModal('⚠️ يلزم رفع الموقع أولاً', `
        <li>خاصية "الإضافة إلى الشاشة الرئيسية" تعمل فقط عندما يكون الموقع مستضافًا على رابط حقيقي يبدأ بـ <strong>https://</strong>.</li>
        <li>فتح الملف مباشرة من جهازك (file://) لا يفعّل هذه الخاصية في أي متصفح.</li>
        <li>بعد رفع كل الملفات معًا على الاستضافة، أعد فتح الموقع من رابطه الحقيقي وستعمل الأيقونة وزر الإضافة تلقائيًا.</li>
      `);
    });
    installNote.textContent = 'يعمل هذا الزر فعليًا بعد رفع الموقع على استضافة بـ HTTPS.';
    return;
  }

  if (isIOS) {
    installBtn.addEventListener('click', ()=>{
      showModal('📲 إضافة "الفجر" إلى الشاشة الرئيسية', `
        <li>اضغط على أيقونة المشاركة <span class="share-icon">⬆︎</span> أسفل شاشة سفاري (أو أعلاها في بعض الإصدارات).</li>
        <li>مرّر للأسفل واختر <strong>"إضافة إلى الشاشة الرئيسية"</strong> (Add to Home Screen).</li>
        <li>اضغط <strong>"إضافة"</strong> أعلى الشاشة، وستظهر أيقونة الفجر على هاتفك مثل أي تطبيق.</li>
      `);
    });
    return;
  }

  window.addEventListener('beforeinstallprompt', (e)=>{ e.preventDefault(); deferredPrompt = e; });

  installBtn.addEventListener('click', async ()=>{
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        installBtnText.textContent = 'تمت الإضافة ✓';
        installNote.textContent = 'ستجد أيقونة الفجر على شاشتك الرئيسية';
      }
      deferredPrompt = null;
      return;
    }
    if (isAndroid) {
      showModal('📲 إضافة "الفجر" إلى الشاشة الرئيسية', `
        <li>اضغط على قائمة المتصفح (⋮ ثلاث نقاط) أعلى الشاشة.</li>
        <li>اختر <strong>"تثبيت التطبيق"</strong> أو <strong>"إضافة إلى الشاشة الرئيسية"</strong>.</li>
        <li>أكّد الإضافة، وستظهر أيقونة الفجر على شاشتك الرئيسية.</li>
      `);
    } else if (isFirefox) {
      showModal('📲 إضافة "الفجر" إلى شاشتك', `
        <li>فايرفوكس على الحاسوب لا يدعم التثبيت التلقائي لهذا النوع من المواقع.</li>
        <li>على الهاتف: افتح قائمة المتصفح (⋮) واختر <strong>"تثبيت"</strong> أو <strong>"إضافة إلى الشاشة الرئيسية"</strong> إن ظهرت.</li>
        <li>بديل عملي: أنشئ اختصارًا للرابط في المفضلة لعودة سريعة.</li>
      `);
    } else {
      showModal('📲 إضافة "الفجر" إلى جهازك', `
        <li>ابحث عن أيقونة التثبيت ⊕ داخل شريط عنوان المتصفح (تظهر في كروم وإيدج على الحاسوب).</li>
        <li>أو افتح قائمة المتصفح (⋮ أو ≡) وابحث عن <strong>"تثبيت الفجر"</strong> أو <strong>"Install"</strong>.</li>
        <li>إن لم تظهر الخيارات، أضف الصفحة إلى المفضلة للرجوع إليها بسرعة.</li>
      `);
    }
  });

  window.addEventListener('appinstalled', ()=>{
    installBtn.style.display = 'none';
    installNote.textContent = 'تمت إضافة الفجر إلى شاشتك، جزاك الله خيرًا 🌅';
  });
})();

/* ============ SERVICE WORKER ============ */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', ()=>{
    navigator.serviceWorker.register('sw.js').catch(()=>{});
  });
}

/* ============ SUPPORT PAGE: copy account/IBAN (only runs if buttons exist) ============ */
document.querySelectorAll('.copy-btn').forEach(btn=>{
  btn.addEventListener('click', async ()=>{
    const text = btn.dataset.copy;
    const original = btn.textContent;
    try{
      if(navigator.clipboard && window.isSecureContext){
        await navigator.clipboard.writeText(text);
      }else{
        const tmp = document.createElement('textarea');
        tmp.value = text;
        tmp.style.position = 'fixed';
        tmp.style.opacity = '0';
        document.body.appendChild(tmp);
        tmp.select();
        document.execCommand('copy');
        document.body.removeChild(tmp);
      }
      btn.textContent = 'تم النسخ ✓';
    }catch(err){
      btn.textContent = 'انسخ يدويًا';
    }
    setTimeout(()=>{ btn.textContent = original; }, 2000);
  });
});
