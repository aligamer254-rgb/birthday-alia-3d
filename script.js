// ====== إعداد مشهد 3D (Three.js) والتأثيرات الإضافية ======

// تعريف المتغيرات الأساسية و DOM
const container = document.getElementById('container-3d');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });

const overlay = document.getElementById('overlay');
const surpriseMessage = document.getElementById('surprise-message');
const birthdaySong = document.getElementById('birthday-song');

// إعداد الريندر والظلال
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x050515); 
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; 
container.appendChild(renderer.domElement);

// تحديد موضع الكاميرا
camera.position.z = 5;

// ====== الإضاءة المعدلة: إضاءة نيون درامية ======
const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffccff, 3); 
directionalLight.position.set(3, 10, 5);
directionalLight.castShadow = true; 
directionalLight.shadow.mapSize.width = 1024;
directionalLight.shadow.mapSize.height = 1024;
scene.add(directionalLight);

const neonLight = new THREE.PointLight(0x00ffff, 50, 10);
neonLight.position.set(-5, 5, 0);
scene.add(neonLight);

// ====== الأرضية العاكسة (Ground Plane) ======
const groundGeometry = new THREE.PlaneGeometry(30, 30);
const groundMaterial = new THREE.MeshPhongMaterial({
    color: 0x000000,
    shininess: 150, 
    specular: 0x555555, 
    transparent: true,
    opacity: 0.7
});
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2; 
ground.position.y = -1.5; 
ground.receiveShadow = true; 
scene.add(ground);

// إضافة التحكم (لتدوير المشهد بالماوس بمرونة)
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; 
controls.dampingFactor = 0.05;
controls.autoRotate = true; 
controls.autoRotateSpeed = 0.5;

// === تعريف المتغير الذي سيحمل النموذج الاحترافي ===
let birthdayObject; 
let countdownPhase = 'normal'; 

// ====== تحميل نموذج GLTF الاحترافي ======
const loader = new THREE.GLTFLoader();

loader.load(
    'models/cake.glb', 
    function (gltf) {
        birthdayObject = gltf.scene;
        scene.add(birthdayObject);

        // تعديل الحجم والموضع
        birthdayObject.scale.set(1.5, 1.5, 1.5); 
        birthdayObject.position.y = -0.5; 

        // تفعيل الظلال والتحكم باللون
        const desiredColor = new THREE.Color(0xff69b4); // وردي نيون

        birthdayObject.traverse((node) => {
            if (node.isMesh) {
                node.castShadow = true;
                node.receiveShadow = true;
                
                if (node.material.isMeshStandardMaterial || node.material.isMeshPhongMaterial) {
                    node.material.color.copy(desiredColor); 
                    node.material.emissive = new THREE.Color(0xff69b4); 
                    node.material.emissiveIntensity = 0.5; 
                    node.material.needsUpdate = true;
                }
            }
        });

        console.log('Birthday object loaded successfully!');
    },
    function (error) {
        console.error('An error happened while loading the 3D model:', error);
        // نموذج احتياطي عند الفشل
        const fallbackGeometry = new THREE.TorusGeometry(1, 0.3, 16, 100);
        const fallbackMaterial = new THREE.MeshPhongMaterial({ color: 0xccff00 });
        birthdayObject = new THREE.Mesh(fallbackGeometry, fallbackMaterial);
        scene.add(birthdayObject);
    }
);

// ====== إضافة مؤثر النجوم (Stars) ======
const starsGeometry = new THREE.BufferGeometry();
const starsCount = 1000;
const positions = new Float32Array(starsCount * 3);
for (let i = 0; i < starsCount * 3; i++) {
    positions[i] = (Math.random() - 0.5) * 100; 
}
starsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.1, transparent: true, opacity: 0.7 });
const starField = new THREE.Points(starsGeometry, starMaterial);
scene.add(starField);
// ====== إضافة القمر (Moon) إلى المشهد (Moon) ======
let moon = null;

// تحميل صورة سطح القمر
const moonTexture = new THREE.TextureLoader().load('images/moon_texture.jpeg');

const moonLight = new THREE.PointLight(0xffffff, 2, 30);
moonLight.position.set(-10, 5, -10);
scene.add(moonLight);



const moonMaterial = new THREE.MeshStandardMaterial({
    map: moonTexture,
    roughness: 0.8,   
    metalness: 0.0,   
});


moonMaterial.emissive = new THREE.Color(0x222222);
moonMaterial.emissiveIntensity = 0.15;
moonTexture.encoding = THREE.sRGBEncoding;
moonMaterial.needsUpdate = true;

const moonGeometry = new THREE.SphereGeometry(3, 64, 64);
moon = new THREE.Mesh(moonGeometry, moonMaterial);
moon.position.set(-15, 8, -30);
scene.add(moon);
// ====== دالة عرض رقم العد التنازلي للـ 5 ثواني بشكل احترافي ======
// ===============================================
// === دالة إنشاء رقم الـ 5 ثواني الاحترافي (باستخدام GSAP) ===
function displayAnimatedNumber(number) {
    // 1. إزالة الرقم القديم بحركة سحب
    const oldNumber = document.querySelector('.countdown-3d-number');
    if (oldNumber) {
        gsap.to(oldNumber, {
            x: -200, 
            opacity: 0,
            scale: 0.5,
            duration: 0.3,
            onComplete: () => oldNumber.remove()
        });
    }

    // 2. إنشاء العنصر الجديد
    const newNumber = document.createElement('div');
    newNumber.className = 'countdown-3d-number'; 
    newNumber.textContent = number;
    container.appendChild(newNumber);

    // 3. حركة الانبثاق الاحترافية للرقم الجديد
    gsap.fromTo(newNumber, 
        { x: 200, opacity: 0, scale: 0.5 }, 
        { 
            x: 0, 
            opacity: 1, 
            scale: 1, 
            duration: 0.5, 
            ease: "back.out(1.7)" 
        } 
    );
}

// ====== مؤثر الفراشات (3D Butterflies) ======
// ====== مؤثر الفراشات (3D Butterflies) - تم التحديث لشكل فراشة وحركة رفرفة ======
function createConfettiButterflies() {
    const butterflyCount = 30;
    const butterflyMaterials = [
        new THREE.MeshBasicMaterial({ color: 0x00ffff, side: THREE.DoubleSide, transparent: true, opacity: 0.9 }), // أصفر
        new THREE.MeshBasicMaterial({ color: 0x00ffff, side: THREE.DoubleSide, transparent: true, opacity: 0.9 }), // وردي
        new THREE.MeshBasicMaterial({ color: 0x00ffff, side: THREE.DoubleSide, transparent: true, opacity: 0.9 }), // أزرق سماوي
        new THREE.MeshBasicMaterial({ color: 0x00ffff, side: THREE.DoubleSide, transparent: true, opacity: 0.9 }),
        new THREE.MeshBasicMaterial({ color: 0x00ffff, side: THREE.DoubleSide, transparent: true, opacity: 0.9 }),
        new THREE.MeshBasicMaterial({ color: 0x00ffff, side: THREE.DoubleSide, transparent: true, opacity: 0.9 }),
        new THREE.MeshBasicMaterial({ color: 0x00ffff, side: THREE.DoubleSide, transparent: true, opacity: 0.9 }),
        new THREE.MeshBasicMaterial({ color: 0x00ffff, side: THREE.DoubleSide, transparent: true, opacity: 0.9 }),
        new THREE.MeshBasicMaterial({ color: 0x00ffff, side: THREE.DoubleSide, transparent: true, opacity: 0.9 }),
        new THREE.MeshBasicMaterial({ color: 0x00ffff, side: THREE.DoubleSide, transparent: true, opacity: 0.9 }),  // أزرق سماوي
        new THREE.MeshBasicMaterial({ color: 0x00ffff, side: THREE.DoubleSide, transparent: true, opacity: 0.9 })  // أزرق سماوي
    ];

    // شكل جناح الفراشة (نصف جناح)
    const wingShape = new THREE.Shape();
    wingShape.moveTo(0, 0);
    wingShape.bezierCurveTo(0.5, 0.5, 0.8, 0.2, 0.7, 0);
    wingShape.bezierCurveTo(0.8, -0.2, 0.5, -0.5, 0, 0);
    const wingGeometry = new THREE.ShapeGeometry(wingShape);

    for (let i = 0; i < butterflyCount; i++) {
        const butterflyGroup = new THREE.Group(); // مجموعة لكل فراشة للتحكم في الأجنحة

        // الجناح الأيمن
        const rightWing = new THREE.Mesh(wingGeometry, butterflyMaterials[i % butterflyMaterials.length]);
        rightWing.position.x = 0; // موضع الجناح الأول
        butterflyGroup.add(rightWing);

        // الجناح الأيسر (معكوس)
        const leftWing = new THREE.Mesh(wingGeometry, butterflyMaterials[i % butterflyMaterials.length]);
        leftWing.scale.x = -1; // لعكس الجناح
        leftWing.position.x = 0;
        butterflyGroup.add(leftWing);

        // الموضع الأولي للفراشة
        butterflyGroup.position.x = (Math.random() - 0.5) * 10;
        butterflyGroup.position.y = (Math.random() - 0.5) * 8;
        butterflyGroup.position.z = (Math.random() - 0.5) * 5;
        const scale = 0.5 + Math.random() * 0.5;
        butterflyGroup.scale.set(scale, scale, scale);

        scene.add(butterflyGroup);

        // حركة الطيران العشوائية للفراشة بالكامل
        gsap.to(butterflyGroup.position, {
            x: '+=random(-5, 5)', y: '+=random(-3, 3)', z: '+=random(-2, 2)',
            duration: 'random(4, 8)', repeat: -1, yoyo: true, ease: "sine.inOut"
        });
        gsap.to(butterflyGroup.rotation, {
            y: '+=random(-' + Math.PI + ', ' + Math.PI + ')',
            duration: 'random(4, 8)', repeat: -1, yoyo: true, ease: "sine.inOut"
        });

        // حركة رفرفة الأجنحة
        gsap.to(rightWing.rotation, {
            z: Math.PI / 4, // دوران الجناح ليفتح
            duration: 0.5,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut"
        });
        gsap.to(leftWing.rotation, {
            z: -Math.PI / 4, // دوران الجناح المعاكس ليفتح
            duration: 0.5,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut"
        });
    }
}

// ====== مؤثر المفرقعات/القصاصات (Confetti 3D) ======
function createConfetti() {
    const confettiCount = 100;
    const colors = [0xffcc00, 0xff69b4, 0x00ffff, 0xffffff];

    for (let i = 0; i < confettiCount; i++) {
        const geometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
        const material = new THREE.MeshBasicMaterial({ 
            color: colors[Math.floor(Math.random() * colors.length)] 
        });
        const piece = new THREE.Mesh(geometry, material);

        piece.position.set(
            (Math.random() - 0.5) * 0.5,
            -1.0, 
            (Math.random() - 0.5) * 0.5
        );
        scene.add(piece);

        gsap.to(piece.position, {
            x: piece.position.x + (Math.random() - 0.5) * 10,
            y: piece.position.y + 6 + Math.random() * 4,
            z: piece.position.z + (Math.random() - 0.5) * 10, 
            duration: 3 + Math.random() * 2,
            ease: "power2.out",
            onComplete: () => scene.remove(piece)
        });

        gsap.to(piece.rotation, {
            x: Math.random() * Math.PI * 8, y: Math.random() * Math.PI * 8, z: Math.random() * Math.PI * 8,
            duration: 5, ease: "none"
        });
    }
}


// دالة التحريك الرئيسية (Animation Loop)
function animate() {
    requestAnimationFrame(animate);
    starField.rotation.y += 0.0005;
    controls.update(); 
    renderer.render(scene, camera);
}

// تعديل حجم المشهد عند تغيير حجم النافذة
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();


// ===========================================
// ====== كود العد التنازلي ومنطق المفاجأة ======
// ===========================================

// التاريخ الجديد للاختبار (يتم تعديله في كل مرة للاختبار)
const birthdayDate = new Date("November 10, 2025 00:00:00").getTime();

function updateCountdown() {
    const now = new Date().getTime();
    let distance = birthdayDate - now;

    // منع القيم السالبة
    if (distance < 0) distance = 0;

    const totalSeconds = Math.ceil(distance / 1000);
    const MOON_EFFECT_DURATION = 15 * 60 * 1000;

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    if (totalSeconds > 0 && totalSeconds <= 5) {
        if (countdownPhase === 'normal') {
            gsap.to(overlay, { opacity: 0, duration: 0.5, onComplete: () => overlay.style.display = 'none' });
            countdownPhase = '3d';
        }
        displayAnimatedNumber(totalSeconds);

    } else if (totalSeconds > 5) {
        if (countdownPhase !== 'normal') {
            overlay.style.display = 'block';
            gsap.to(overlay, { opacity: 1, duration: 0.5 });
            const finalNumber = document.querySelector('.countdown-3d-number');
            if (finalNumber) finalNumber.remove();
            countdownPhase = 'normal';
        }

        document.getElementById('days').textContent = String(days).padStart(2, '0');
        document.getElementById('hours').textContent = String(hours).padStart(2, '0');
        document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
        document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');
    }

    // نهاية العد
    if (distance === 0) {
        clearInterval(countdownInterval);

        const finalNumber = document.querySelector('.countdown-3d-number');
        if (finalNumber) finalNumber.remove();

        if (birthdayObject) scene.remove(birthdayObject);
        scene.remove(ground);

        gsap.fromTo(
            surpriseMessage,
            { y: 50, opacity: 0, scale: 0.8, xPercent: -50, yPercent: -50 },
            {
                y: '0%',
                opacity: 1,
                scale: 1,
                duration: 1.5,
                ease: "power3.out",
                onStart: () => {
                    surpriseMessage.classList.remove('hidden');
                    createConfettiButterflies();
                    createConfetti();
                }
            }
        );
    }
}

const countdownInterval = setInterval(updateCountdown, 1000);
updateCountdown();



// ====== كود الزر الجديد (تمت إضافته لضمان عمل الأغنية) ======
surpriseMessage.addEventListener('click', function() {
    // التأكد من أن الأغنية متوقفة قبل التشغيل
    if (birthdaySong.paused) { 
        birthdaySong.play().then(() => {
            // إخفاء موجه النقر بعد التشغيل الأول
            const playPrompt = document.getElementById('play-prompt');
            if (playPrompt) playPrompt.remove(); 
        }).catch(e => {
            console.error("Manual play failed:", e);
        });
    }

});

