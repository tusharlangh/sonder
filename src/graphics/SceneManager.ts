import * as THREE from 'three';
import { createNoise3D } from 'simplex-noise';

export class SceneManager {
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;

  private activeSceneIndex: number = 0;
  private activeTemplateId: string | null = null;
  private objects: THREE.Object3D[] = [];
  private noise3D = createNoise3D();

  private particles: THREE.Points | null = null;
  private lineMesh: THREE.Line | null = null;
  private noiseSphere: THREE.Mesh | null = null;
  private templateGroup: THREE.Group | null = null;
  private roseGroup: THREE.Group | null = null;
  private terrainMesh: THREE.Mesh | null = null;

  private waterfallGroup: THREE.Group | null = null;
  private waterfallParticles: THREE.Points | null = null;
  private oceanMesh: THREE.Mesh | null = null;
  private forestGroup: THREE.Group | null = null;
  private mountainMesh: THREE.Mesh | null = null;

  public activeShaderMaterial: THREE.ShaderMaterial | null = null;

  constructor() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x000000);

    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.z = 5;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    this.scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight1.position.set(5, 8, 5);
    this.scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x4488ff, 0.5);
    dirLight2.position.set(-5, -3, 3);
    this.scene.add(dirLight2);

    const rimLight = new THREE.DirectionalLight(0xff8844, 0.3);
    rimLight.position.set(0, 0, -5);
    this.scene.add(rimLight);

    this.setScene(0);
  }

  public setScene(index: number) {
    this.activeSceneIndex = index;
    this.activeTemplateId = null;
    this.clearScene();

    switch (index) {
      case 0: this.buildSculpture(); break;
      case 1: this.buildRose(); break;
      case 2: this.buildTerrain(); break;
      case 3: this.buildGalaxy(); break;
      case 4: this.buildWaterfall(); break;
      case 5: this.buildOcean(); break;
      case 6: this.buildForest(); break;
      case 7: this.buildMountains(); break;
      case 8: this.buildSunset(); break;
      case 9: this.buildAurora(); break;
      case 10: this.buildRainstorm(); break;
      case 11: this.buildDesert(); break;
      case 12: this.buildBlackHole(); break;
      case 13: this.buildEarth(); break;
      case 14: this.buildMars(); break;
      case 15: this.buildGasGiant(); break;
      default: this.buildSculpture(); break;
    }
  }

  private clearScene() {

    this.scene.fog = null;
    this.scene.background = new THREE.Color(0x000000);
    for (const obj of this.objects) {
      this.scene.remove(obj);
      if (obj instanceof THREE.Mesh || obj instanceof THREE.Points || obj instanceof THREE.Line) {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m) => m.dispose());
          } else {
            obj.material.dispose();
          }
        }
      }

      if (obj instanceof THREE.Group) {
        obj.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.geometry?.dispose();
            if (child.material) {
              if (Array.isArray(child.material)) {
                child.material.forEach((m) => m.dispose());
              } else {
                child.material.dispose();
              }
            }
          }
        });
      }
    }
    this.objects = [];
    this.particles = null;
    this.lineMesh = null;
    this.noiseSphere = null;
    this.templateGroup = null;
    this.roseGroup = null;
    this.terrainMesh = null;
    this.waterfallGroup = null;
    this.waterfallParticles = null;
    this.oceanMesh = null;
    this.forestGroup = null;
    this.mountainMesh = null;
    this.activeShaderMaterial = null;
  }

  private addSkySphere(topColor: number, bottomColor: number, midColor?: number) {
    const geo = new THREE.SphereGeometry(80, 32, 32);
    const pos = geo.attributes.position;
    const colors = new Float32Array(pos.count * 3);
    const top = new THREE.Color(topColor);
    const mid = midColor !== undefined ? new THREE.Color(midColor) : top.clone().lerp(new THREE.Color(bottomColor), 0.5);
    const bot = new THREE.Color(bottomColor);
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i);
      const t = (y + 80) / 160;
      let col: THREE.Color;
      if (t < 0.5) {
        col = bot.clone().lerp(mid, t * 2);
      } else {
        col = mid.clone().lerp(top, (t - 0.5) * 2);
      }
      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
    }
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    const mat = new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide, fog: false });
    const sky = new THREE.Mesh(geo, mat);
    this.scene.add(sky);
    this.objects.push(sky);
  }

  private create2DShaderScene(fragmentShader: string) {
    const vertexShader = `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position, 1.0);
      }
    `;

    const uniforms = {
      uTime: { value: 0.0 },
      uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
    };

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
      depthWrite: false,
      depthTest: false
    });

    const geometry = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(geometry, material);

    this.scene.add(mesh);
    this.objects.push(mesh);
    this.activeShaderMaterial = material;

    this.camera.position.set(0, 0, 1);
    this.camera.lookAt(0, 0, 0);
  }

  public resize(width: number, height: number) {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    if (this.activeShaderMaterial) {
      this.activeShaderMaterial.uniforms.uResolution.value.set(width, height);
    }
  }

  public update(timeInSeconds: number) {
    if (this.activeShaderMaterial) {
      this.activeShaderMaterial.uniforms.uTime.value = timeInSeconds;
    }

    if (this.templateGroup) {
      this.templateGroup.rotation.y = timeInSeconds * 0.5;
    }
  }

  private buildSculpture() {
    this.create2DShaderScene(`
      uniform float uTime;
      varying vec2 vUv;

      void main() {
        vec2 uv = vUv * 3.0;
        float t = uTime * 0.5;
        vec2 p = vec2(sin(uv.x + t), cos(uv.y + t));
        float warp = sin(length(uv + p) * 3.0 - t * 2.0);

        vec3 col = vec3(0.5) + 0.5 * cos(uTime + uv.xyx + vec3(0, 2, 4) + warp);
        gl_FragColor = vec4(col * 1.5, 1.0);
      }
    `);
  }

  private buildRose() {
    this.create2DShaderScene(`
      uniform float uTime;
      varying vec2 vUv;

      float random2(vec2 p) {
        return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
      }

      void main() {
        vec2 uv = vUv * 8.0;
        vec2 id = floor(uv);
        vec2 f = fract(uv);
        float minDist = 1.0;

        for(int y = -1; y <= 1; y++) {
          for(int x = -1; x <= 1; x++) {
            vec2 offset = vec2(float(x), float(y));
            vec2 point = vec2(random2(id + offset));
            point = 0.5 + 0.5 * sin(uTime * 1.5 + 6.2831 * point);
            float d = length(offset + point - f);
            minDist = min(minDist, d);
          }
        }

        vec3 col = vec3(1.0 - minDist);

        col *= vec3(0.9, 0.3, 0.5);
        gl_FragColor = vec4(col * 2.0, 1.0);
      }
    `);
  }

  private buildTerrain() {
    this.create2DShaderScene(`
      uniform float uTime;
      varying vec2 vUv;

      void main() {
        vec2 uv = vUv * 5.0 - 2.5;

        float a = 1.0, f = 1.0;
        float v = 0.0;

        for(int i = 0; i < 4; i++) {
          v += sin(uv.x * f + uTime) + cos(uv.y * f + uTime * 0.8);
          f *= 2.0;
          a *= 0.5;
        }

        v = abs(v) * 0.5;

        vec3 col = vec3(0.1, 0.8, 0.3) * v;
        gl_FragColor = vec4(col * 1.5, 1.0);
      }
    `);
  }

  private buildGalaxy() {
    this.create2DShaderScene(`
      uniform float uTime;
      varying vec2 vUv;
      uniform vec2 uResolution;

      void main() {

        vec2 p = (vUv - 0.5) * 2.0;
        p.x *= uResolution.x / uResolution.y;

        float a = atan(p.y, p.x);
        float r = length(p);

        float v = 0.0;
        for (float i = 1.0; i < 5.0; i++) {
          float dist = fract(1.0 / r + uTime * i * 0.2);
          float angle = a + uTime * 0.5;
          v += smoothstep(0.9, 1.0, sin(dist * 20.0) * sin(angle * 10.0));
        }

        vec3 color = vec3(0.5, 0.2, 0.8) * v * r;
        color += vec3(0.2, 0.5, 1.0) * smoothstep(0.0, 0.5, 1.0 - r);

        gl_FragColor = vec4(color, 1.0);
      }
    `);
  }

  private buildWaterfall() {
    this.create2DShaderScene(`
      uniform float uTime;
      uniform vec2 uResolution;
      varying vec2 vUv;

      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float noise(vec2 p){
        vec2 i=floor(p);vec2 f=fract(p);f=f*f*(3.0-2.0*f);
        return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);
      }
      float fbm(vec2 p){float v=0.0,a=0.5;mat2 m=mat2(1.6,1.2,-1.2,1.6);for(int i=0;i<6;i++){v+=a*noise(p);p=m*p;a*=0.5;}return v;}

      float ridge(vec2 p) {
        float n=noise(p);
        return 1.0-abs(n);
      }
      float fbmRidge(vec2 p) {
        float v=0.0,a=0.5;mat2 m=mat2(1.6,1.2,-1.2,1.6);
        for(int i=0;i<5;i++){v+=a*ridge(p);p=m*p;a*=0.5;}
        return v;
      }

      void main(){
        vec2 uv=vUv;
        float ar=uResolution.x/uResolution.y;
        uv.x*=ar;

        vec3 sky=mix(vec3(0.1,0.15,0.2),vec3(0.02,0.05,0.08),uv.y);

        float gorgeWidth=0.15+uv.y*0.25;
        float centerLine=ar*0.5;

        float wallDistortion=fbm(vec2(uv.x*4.0,uv.y*3.0))*0.15;
        float distToCenter=abs(uv.x-centerLine)-wallDistortion;

        float isRock=smoothstep(gorgeWidth*0.7,gorgeWidth,distToCenter);

        float rockTex=fbmRidge(uv*vec2(12.0,5.0));
        vec3 rockCol=mix(vec3(0.05,0.05,0.06),vec3(0.2,0.18,0.15),rockTex);

        rockCol*=0.8+0.4*fbm(vec2(uv.x*25.0,uv.y*2.0));

        float moss=fbm(uv*vec2(8.0,15.0));
        vec3 mossCol=vec3(0.08,0.18,0.05);
        rockCol=mix(rockCol,mossCol,smoothstep(0.4,0.7,moss)*0.6);

        float fallWidth=0.08 + (1.0-uv.y)*0.04;
        float fallCenter=centerLine + sin(uv.y*4.0)*0.02;
        float fallDist=abs(uv.x-fallCenter);
        float fallMask=smoothstep(fallWidth,fallWidth*0.5,fallDist);

        fallMask*=(1.0-isRock);

        vec2 wuv=vec2(uv.x*30.0,uv.y*5.0-uTime*4.0);
        float flow1=fbm(wuv);
        float flow2=fbm(wuv*2.0+vec2(0.0,uTime*2.0));
        float waterDetail=flow1*0.6+flow2*0.4;

        vec3 waterLit=vec3(0.95,0.98,1.0);
        vec3 waterShade=vec3(0.4,0.6,0.8);
        vec3 waterCol=mix(waterShade,waterLit,smoothstep(0.3,0.7,waterDetail));

        waterCol+=vec3(1.0)*pow(waterDetail,4.0)*0.8;

        float poolLine=0.2;
        float isPool=smoothstep(poolLine+0.05,poolLine-0.01,uv.y);

        vec2 puv=vec2(uv.x*8.0,uv.y*20.0+uTime*0.5);
        float pTex=fbm(puv);
        vec3 pCol=mix(vec3(0.05,0.15,0.2),vec3(0.1,0.3,0.4),pTex);

        float hitDist=length(vec2(uv.x-fallCenter,(uv.y-poolLine)*4.0));
        float foam=smoothstep(0.2,0.0,hitDist)*fbm(vec2(uv.x*20.0-uTime,uv.y*40.0));
        pCol=mix(pCol,vec3(0.8,0.9,1.0),foam*0.9);

        float ripple=sin(hitDist*40.0-uTime*6.0)*0.5+0.5;
        pCol+=vec3(0.1,0.2,0.25)*ripple*smoothstep(0.5,0.1,hitDist);

        float mistDen=fbm(vec2(uv.x*3.0+sin(uTime*0.2),uv.y*4.0-uTime*0.4));
        float mistMask=smoothstep(0.4,0.0,uv.y-0.1)*smoothstep(1.0,0.2,abs(uv.x-centerLine)*2.0);
        float mistIntensity=mistDen*mistMask;

        float vegL=smoothstep(0.25*ar,0.05*ar,uv.x)*smoothstep(0.0,0.8,uv.y);
        float vegR=smoothstep(0.75*ar,0.95*ar,uv.x)*smoothstep(0.0,0.8,uv.y);
        float vegTop=smoothstep(0.7,0.95,uv.y);
        float vegBase=(vegL+vegR+vegTop);

        float leafTex=fbm(uv*vec2(15.0,15.0));

        float isVeg=smoothstep(0.4,0.6,vegBase*leafTex*1.5);

        vec3 vegCol=mix(vec3(0.01,0.03,0.01),vec3(0.04,0.08,0.02),leafTex);

        vegCol+=vec3(0.1,0.15,0.05)*smoothstep(0.7,1.0,uv.y)*leafTex;

        vec3 col=sky;

        float backTex=fbm(uv*8.0);
        vec3 backWall=mix(vec3(0.08,0.09,0.1),vec3(0.15,0.16,0.18),backTex);
        col=mix(col,backWall,smoothstep(0.7,0.3,uv.y)*(1.0-isRock));

        col=mix(col,rockCol,isRock);

        col=mix(col,waterCol,fallMask);

        col=mix(col,pCol,isPool);

        vec3 mistCol=mix(vec3(0.4,0.5,0.6),vec3(0.9,0.95,1.0),smoothstep(0.2,0.4,uv.y));
        col=mix(col,mistCol,mistIntensity*0.8);

        col=mix(col,vegCol,isVeg);

        col=mix(col,vec3(0.05,0.08,0.12),smoothstep(0.2,1.0,uv.y)*0.2*(1.0-fallMask));

        float vig=uv.y*(1.0-uv.y)*(uv.x/ar)*(1.0-uv.x/ar);
        col*=pow(vig*15.0, 0.2);

        gl_FragColor=vec4(col,1.0);
      }
    `);
  }

  private buildOcean() {
    this.create2DShaderScene(`
      uniform float uTime;
      uniform vec2 uResolution;
      varying vec2 vUv;

      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float noise(vec2 p){
        vec2 i=floor(p);vec2 f=fract(p);f=f*f*(3.0-2.0*f);
        return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);
      }
      float fbm(vec2 p){float v=0.0,a=0.5;for(int i=0;i<5;i++){v+=a*noise(p);p*=2.01;a*=0.5;}return v;}

      void main(){
        vec2 uv=vUv;
        float ar=uResolution.x/uResolution.y;
        uv.x*=ar;
        float horizon=0.45;

        float skyT=smoothstep(horizon,1.0,uv.y);
        vec3 skyLow=vec3(0.85,0.55,0.35);
        vec3 skyMid=vec3(0.45,0.6,0.85);
        vec3 skyHi=vec3(0.2,0.35,0.7);
        vec3 sky=mix(skyLow,skyMid,smoothstep(0.0,0.5,skyT));
        sky=mix(sky,skyHi,smoothstep(0.5,1.0,skyT));

        vec2 sunPos=vec2(ar*0.5,0.62);
        float sunD=length(uv-sunPos);
        sky+=vec3(1.0,0.85,0.5)*exp(-sunD*8.0)*0.9;
        sky+=vec3(1.0,0.6,0.3)*exp(-sunD*3.0)*0.4;

        float cl=fbm(vec2(uv.x*3.0+uTime*0.015,uv.y*5.0));
        sky=mix(sky,vec3(1.0,0.95,0.88),smoothstep(0.45,0.7,cl)*0.5*skyT);

        float oceanT=smoothstep(horizon,0.0,uv.y);
        vec2 ouv=vec2(uv.x*6.0,(horizon-uv.y)*30.0/(horizon-uv.y+0.3));
        ouv.x+=uTime*0.3;

        float w1=sin(ouv.x*1.5+uTime*0.8)*sin(ouv.y*0.8-uTime*0.3)*0.3;
        float w2=sin(ouv.x*3.0-uTime*1.2+ouv.y*0.5)*0.15;
        float w3=noise(ouv*2.0+uTime*0.5)*0.2;
        float waves=w1+w2+w3;

        vec3 deepOcean=vec3(0.02,0.08,0.18);
        vec3 midOcean=vec3(0.05,0.2,0.4);
        vec3 surfOcean=vec3(0.15,0.4,0.55);
        float depthFade=smoothstep(0.0,1.0,oceanT);
        vec3 oceanCol=mix(surfOcean,deepOcean,depthFade);

        float waveHi=smoothstep(0.2,0.5,waves);
        oceanCol=mix(oceanCol,vec3(0.3,0.55,0.7),waveHi*0.5);

        float foam=smoothstep(0.35,0.45,waves)*smoothstep(0.6,0.3,oceanT);
        oceanCol=mix(oceanCol,vec3(0.85,0.9,0.95),foam*0.7);

        float sunRefl=exp(-abs(uv.x-sunPos.x)*6.0)*smoothstep(0.0,horizon,horizon-uv.y);
        float shimmer=sin(ouv.x*10.0+uTime*3.0)*sin(ouv.y*5.0-uTime*2.0)*0.5+0.5;
        oceanCol+=vec3(1.0,0.8,0.5)*sunRefl*shimmer*0.6;

        vec3 col=uv.y>horizon?sky:oceanCol;

        float haze=exp(-abs(uv.y-horizon)*15.0);
        col=mix(col,vec3(0.8,0.7,0.6),haze*0.4);

        gl_FragColor=vec4(col,1.0);
      }
    `);
  }

  private buildForest() {
    this.create2DShaderScene(`
      uniform float uTime;
      uniform vec2 uResolution;
      varying vec2 vUv;

      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float noise(vec2 p){
        vec2 i=floor(p);vec2 f=fract(p);f=f*f*(3.0-2.0*f);
        return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);
      }
      float fbm(vec2 p){float v=0.0,a=0.5;mat2 m=mat2(1.6,1.2,-1.2,1.6);for(int i=0;i<5;i++){v+=a*noise(p);p=m*p;a*=0.5;}return v;}

      float tree(vec2 uv, float x, float w, float bot, float top) {
        float edge = smoothstep(x-w,x-w+0.005,uv.x)*smoothstep(x+w,x+w-0.005,uv.x);
        return edge * step(bot, uv.y) * step(uv.y, top);
      }

      void main(){
        vec2 uv=vUv;
        float ar=uResolution.x/uResolution.y;
        uv.x*=ar;

        vec3 sky=mix(vec3(0.7,0.85,0.6),vec3(0.2,0.4,0.15),uv.y);
        sky=mix(sky,vec3(0.9,0.95,0.7),smoothstep(0.6,1.0,uv.y)*0.6);

        vec2 sunP=vec2(ar*0.6,1.1);
        float rays=0.0;
        vec2 rayDir=normalize(uv-sunP);
        for(int i=0;i<12;i++){

          vec2 p=uv-rayDir*(float(i)*0.05);

          float den=fbm(vec2(p.x*8.0+uTime*0.05,p.y*8.0-uTime*0.02));
          rays+=smoothstep(0.4,0.6,den)*(1.0-float(i)/12.0);
        }
        rays/=12.0;
        float sunMask=exp(-length(uv-sunP)*2.5);
        sky+=vec3(1.0,0.95,0.7)*rays*sunMask*1.2;

        float groundLine=0.12+fbm(vec2(uv.x*2.0,0.0))*0.06;
        float isGround=smoothstep(groundLine+0.015,groundLine,uv.y);
        vec3 groundCol=mix(vec3(0.08,0.06,0.04),vec3(0.18,0.12,0.08),fbm(uv*15.0));

        groundCol=mix(groundCol,vec3(0.12,0.22,0.08),fbm(uv*25.0)*0.6);

        vec3 col=sky;

        float farGround=groundLine+0.1;
        float farMask=0.0;
        for(float i=0.0;i<8.0;i++){
          float tx=hash(vec2(i,11.0))*ar;
          float tw=0.01+hash(vec2(i,12.0))*0.01;
          farMask=max(farMask,tree(uv,tx,tw,farGround,1.0));
        }

        float cFar=fbm(vec2(uv.x*6.0,uv.y*4.0));
        farMask=max(farMask,smoothstep(0.5,0.8,uv.y)*smoothstep(0.4,0.6,cFar));
        vec3 farCol=vec3(0.25,0.35,0.2);
        col=mix(col,farCol,farMask*0.8);

        float midGround=groundLine+0.05;
        float midMask=0.0;
        for(float i=0.0;i<6.0;i++){
          float tx=hash(vec2(i,21.0))*ar;
          float tw=0.02+hash(vec2(i,22.0))*0.015;
          midMask=max(midMask,tree(uv,tx,tw,midGround,1.0));
        }
        float cMid=fbm(vec2(uv.x*8.0+5.0,uv.y*5.0+2.0));
        midMask=max(midMask,smoothstep(0.6,0.9,uv.y)*smoothstep(0.35,0.55,cMid));

        float barkM=fbm(uv*vec2(15.0,40.0));
        vec3 midCol=mix(vec3(0.1,0.08,0.05),vec3(0.18,0.15,0.1),barkM);

        midCol+=vec3(0.1,0.15,0.05)*smoothstep(0.6,0.3,uv.x)*0.3;
        col=mix(col,midCol,midMask);

        float nearMask=0.0;
        float nTx1=0.25*ar, nTw1=0.05;
        float nTx2=0.75*ar, nTw2=0.08;
        nearMask=max(nearMask,tree(uv,nTx1,nTw1,groundLine,1.1));
        nearMask=max(nearMask,tree(uv,nTx2,nTw2,groundLine,1.1));

        float bark=fbm(uv*vec2(20.0,60.0));
        vec3 nearCol=mix(vec3(0.06,0.04,0.03),vec3(0.13,0.1,0.07),bark);

        float moss=fbm(uv*15.0)*smoothstep(0.0,nTw1*1.5,nTx1-uv.x)*smoothstep(0.6,0.0,uv.y);
        nearCol=mix(nearCol,vec3(0.1,0.2,0.05),moss);
        col=mix(col,nearCol,nearMask);

        float cNear=fbm(vec2(uv.x*10.0+sin(uTime*0.1)*0.2,uv.y*8.0));
        float leafMask=smoothstep(0.7,0.95,uv.y)*smoothstep(0.3,0.5,cNear);
        vec3 leafCol=mix(vec3(0.05,0.15,0.03),vec3(0.15,0.4,0.08),fbm(uv*25.0));

        leafCol=mix(leafCol,vec3(0.4,0.6,0.1),sunMask*0.4);
        col=mix(col,leafCol,leafMask);

        col=mix(col,groundCol,isGround);

        float fogDen=fbm(vec2(uv.x*3.0+uTime*0.1,uv.y*10.0));
        float fog=smoothstep(0.25,0.0,uv.y)*smoothstep(0.3,0.7,fogDen);
        col=mix(col,vec3(0.5,0.55,0.45),fog*0.6);

        vec2 ffUv=uv*15.0;
        ffUv.y+=uTime*0.5;
        ffUv.x+=sin(uTime+ffUv.y)*0.5;
        float fflot=hash(floor(ffUv));
        float ff=smoothstep(0.98,1.0,fflot)*smoothstep(0.1,0.4,uv.y)*smoothstep(0.6,0.3,uv.y);
        float ffPuls=sin(uTime*4.0+fflot*100.0)*0.5+0.5;
        col+=vec3(0.8,1.0,0.4)*ff*ffPuls;

        float vig=uv.y*(1.0-uv.y)*(uv.x/ar)*(1.0-uv.x/ar);
        col*=pow(vig*15.0, 0.15);

        gl_FragColor=vec4(col,1.0);
      }
    `);
  }

  private buildMountains() {
    this.create2DShaderScene(`
      uniform float uTime;
      uniform vec2 uResolution;
      varying vec2 vUv;

      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float noise(vec2 p){
        vec2 i=floor(p);vec2 f=fract(p);f=f*f*(3.0-2.0*f);
        return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);
      }
      float fbm(vec2 p){float v=0.0,a=0.5;for(int i=0;i<6;i++){v+=a*noise(p);p*=2.0;a*=0.5;}return v;}

      float mountain(vec2 uv,float offset,float scale,float height){
        float m=fbm(vec2(uv.x*scale+offset,0.0))*height;
        return smoothstep(m-0.01,m+0.01,uv.y);
      }

      void main(){
        vec2 uv=vUv;
        float ar=uResolution.x/uResolution.y;
        uv.x*=ar;

        vec3 skyHi=vec3(0.15,0.3,0.6);
        vec3 skyLow=vec3(0.6,0.7,0.85);
        vec3 sky=mix(skyLow,skyHi,smoothstep(0.4,1.0,uv.y));

        float cl=fbm(vec2(uv.x*2.0+uTime*0.01,uv.y*3.0+2.0));
        sky=mix(sky,vec3(0.95,0.97,1.0),smoothstep(0.45,0.72,cl)*0.55);

        float m1h=fbm(vec2(uv.x*2.0+10.0,0.0))*0.25+0.35;
        float m1=1.0-smoothstep(m1h-0.01,m1h+0.01,uv.y);
        vec3 m1col=vec3(0.45,0.5,0.65);

        float m2h=fbm(vec2(uv.x*3.0+5.0,0.0))*0.3+0.22;
        float m2=1.0-smoothstep(m2h-0.01,m2h+0.01,uv.y);
        vec3 m2col=mix(vec3(0.3,0.35,0.4),vec3(0.25,0.28,0.35),fbm(uv*8.0));

        float snow2=smoothstep(m2h-0.06,m2h-0.02,uv.y)*smoothstep(0.4,0.55,fbm(uv*20.0+2.0));
        m2col=mix(m2col,vec3(0.92,0.95,0.98),snow2*0.8);

        float m3h=fbm(vec2(uv.x*4.0,0.0))*0.22+0.12;
        float m3=1.0-smoothstep(m3h-0.005,m3h+0.005,uv.y);
        vec3 m3col=mix(vec3(0.12,0.15,0.1),vec3(0.2,0.22,0.15),fbm(uv*15.0));

        float treeLine=smoothstep(m3h-0.08,m3h-0.02,uv.y);
        m3col=mix(m3col,vec3(0.08,0.18,0.06),treeLine*0.7);

        float snow3=smoothstep(m3h-0.04,m3h-0.01,uv.y)*smoothstep(0.5,0.65,fbm(uv*25.0));
        m3col=mix(m3col,vec3(0.9,0.93,0.96),snow3*0.7);

        float meadow=smoothstep(0.12,0.08,uv.y);
        vec3 meadowCol=mix(vec3(0.15,0.3,0.08),vec3(0.25,0.45,0.12),fbm(uv*20.0));

        vec3 col=sky;
        col=mix(col,m1col,m1);
        col=mix(col,m2col,m2);
        col=mix(col,m3col,m3);
        col=mix(col,meadowCol,meadow);

        float haze=smoothstep(0.5,0.15,uv.y)*0.15;
        col=mix(col,vec3(0.65,0.7,0.8),haze);

        gl_FragColor=vec4(col,1.0);
      }
    `);
  }

  private buildSunset() {
    this.create2DShaderScene(`
      uniform float uTime;
      uniform vec2 uResolution;
      varying vec2 vUv;

      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float noise(vec2 p){
        vec2 i=floor(p);vec2 f=fract(p);f=f*f*(3.0-2.0*f);
        return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);
      }
      float fbm(vec2 p){float v=0.0,a=0.5;for(int i=0;i<5;i++){v+=a*noise(p);p*=2.0;a*=0.5;}return v;}

      void main(){
        vec2 uv=vUv;
        float ar=uResolution.x/uResolution.y;
        uv.x*=ar;
        float horizon=0.35;

        float skyT=(uv.y-horizon)/(1.0-horizon);
        vec3 col1=vec3(0.95,0.4,0.15);
        vec3 col2=vec3(0.9,0.25,0.2);
        vec3 col3=vec3(0.5,0.15,0.3);
        vec3 col4=vec3(0.15,0.1,0.25);
        vec3 sky=mix(col1,col2,smoothstep(0.0,0.3,skyT));
        sky=mix(sky,col3,smoothstep(0.3,0.6,skyT));
        sky=mix(sky,col4,smoothstep(0.6,1.0,skyT));

        vec2 sunPos=vec2(ar*0.5,horizon+0.08);
        float sunD=length(uv-sunPos);
        sky+=vec3(1.0,0.9,0.4)*exp(-sunD*12.0)*1.2;
        sky+=vec3(1.0,0.5,0.2)*exp(-sunD*4.0)*0.6;
        sky+=vec3(1.0,0.3,0.1)*exp(-sunD*2.0)*0.3;

        float cl1=fbm(vec2(uv.x*4.0+uTime*0.02,uv.y*6.0+1.0));
        float cl2=fbm(vec2(uv.x*6.0-uTime*0.015,uv.y*4.0+3.0));
        float clouds=smoothstep(0.4,0.7,cl1)*0.6+smoothstep(0.45,0.75,cl2)*0.4;
        vec3 cloudCol=mix(vec3(1.0,0.6,0.3),vec3(0.8,0.2,0.15),skyT);
        sky=mix(sky,cloudCol,clouds*0.5*smoothstep(0.0,0.3,skyT));

        float waterT=smoothstep(horizon,0.0,uv.y);
        vec2 wuv=vec2(uv.x*8.0,(horizon-uv.y)*20.0/(horizon-uv.y+0.2));
        float w=sin(wuv.x*2.0+uTime*0.6)*0.2+noise(wuv+uTime*0.3)*0.15;
        vec3 waterCol=mix(vec3(0.8,0.3,0.15),vec3(0.15,0.05,0.1),waterT);

        float refl=exp(-abs(uv.x-sunPos.x)*5.0)*smoothstep(0.0,horizon,horizon-uv.y);
        float shim=sin(wuv.x*15.0+uTime*4.0)*0.5+0.5;
        waterCol+=vec3(1.0,0.7,0.3)*refl*shim*0.8;
        waterCol+=vec3(1.0,0.9,0.5)*refl*pow(shim,4.0)*0.4;

        vec3 col=uv.y>horizon?sky:waterCol;
        float haze=exp(-abs(uv.y-horizon)*12.0);
        col=mix(col,vec3(1.0,0.6,0.25),haze*0.35);

        gl_FragColor=vec4(col,1.0);
      }
    `);
  }

  private buildAurora() {
    this.create2DShaderScene(`
      uniform float uTime;
      uniform vec2 uResolution;
      varying vec2 vUv;

      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float noise(vec2 p){
        vec2 i=floor(p);vec2 f=fract(p);f=f*f*(3.0-2.0*f);
        return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);
      }
      float fbm(vec2 p){float v=0.0,a=0.5;mat2 m=mat2(1.6,1.2,-1.2,1.6);for(int i=0;i<5;i++){v+=a*noise(p);p=m*p;a*=0.5;}return v;}

      vec3 mainAurora(vec2 uv) {
        vec3 col=vec3(0.0);
        float time=uTime*0.05;

        for(int i=0;i<40;i++) {

          float t=float(i)/40.0;
          float yPos=0.9-t*0.5;

          float wave1=sin(uv.x*4.0+time*5.0+t*10.0)*0.1;
          float wave2=sin(uv.x*2.0-time*3.0-t*5.0)*0.15;
          float curtainMap=wave1+wave2;

          float d=abs(uv.y+curtainMap-yPos);
          float intensity=exp(-d*40.0);

          float rayNoise=fbm(vec2(uv.x*15.0+t*20.0+time*10.0,t*5.0));
          intensity*=smoothstep(0.2,0.8,rayNoise);

          float heightFade=smoothstep(0.4,0.6,yPos)*smoothstep(0.9,0.7,yPos);
          intensity*=heightFade;

          vec3 cCol=mix(vec3(0.1,0.9,0.3),vec3(0.8,0.2,0.7),1.0-t);

          col+=cCol*intensity*0.04;
        }
        return col;
      }

      void main(){
        vec2 uv=vUv;
        float ar=uResolution.x/uResolution.y;
        vec2 ruv=uv;
        ruv.x*=ar;

        vec3 sky=mix(vec3(0.01,0.02,0.05),vec3(0.0,0.0,0.02),uv.y);

        float mw=fbm(vec2(ruv.x*2.0,ruv.y*2.0+uTime*0.01));
        sky+=vec3(0.05,0.08,0.15)*smoothstep(0.3,0.7,mw);

        vec2 stUv=uv*vec2(ar,1.0)*150.0;
        float stHash=hash(floor(stUv));
        float stStar=smoothstep(0.99,1.0,stHash);
        float stPuls=sin(uTime*2.0+stHash*100.0)*0.5+0.5;
        sky+=vec3(0.8,0.9,1.0)*stStar*stPuls*smoothstep(0.1,0.3,uv.y);

        vec2 stUv2=uv*vec2(ar,1.0)*50.0;
        float stHash2=hash(floor(stUv2));
        float stStar2=smoothstep(0.995,1.0,stHash2);
        vec2 stF=fract(stUv2)-0.5;
        float flare=exp(-length(stF)*20.0)*(sin(uTime+stHash2*10.0)*0.5+0.5);
        sky+=vec3(1.0,0.95,0.8)*stStar2*flare;

        vec3 auroraCol=mainAurora(ruv)*2.0;
        sky+=auroraCol;

        sky+=vec3(0.05,0.2,0.1)*pow(length(auroraCol),0.5)*0.5;

        float ground=0.15+fbm(vec2(ruv.x*2.0,0.0))*0.05;
        float isGround=smoothstep(ground+0.01,ground,uv.y);
        vec3 snow=mix(vec3(0.08,0.1,0.15),vec3(0.15,0.2,0.25),fbm(ruv*8.0));

        snow+=auroraCol*0.3*smoothstep(0.0,ground,uv.y);

        vec3 col=mix(sky,snow,isGround);
        gl_FragColor=vec4(col,1.0);
      }
    `);
  }

  private buildRainstorm() {
    this.create2DShaderScene(`
      uniform float uTime;
      uniform vec2 uResolution;
      varying vec2 vUv;

      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float noise(vec2 p){
        vec2 i=floor(p);vec2 f=fract(p);f=f*f*(3.0-2.0*f);
        return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);
      }
      float fbm(vec2 p){float v=0.0,a=0.5;mat2 m=mat2(1.6,1.2,-1.2,1.6);for(int i=0;i<5;i++){v+=a*noise(p);p=m*p;a*=0.5;}return v;}

      float rainLayer(vec2 uv, float scale, float speed, float angle) {

        float s=sin(angle), c=cos(angle);
        vec2 ruv=vec2(uv.x*c-uv.y*s, uv.x*s+uv.y*c);
        ruv*=scale;
        ruv.y-=uTime*speed;

        vec2 id=floor(ruv);
        vec2 f=fract(ruv);

        float h=hash(id);
        float dropLen=0.3+h*0.4;
        float drop=smoothstep(0.1,0.0,abs(f.x-0.5-h*0.2));
        drop*=smoothstep(dropLen,dropLen-0.1,f.y)*smoothstep(0.0,0.1,f.y);

        return drop*step(0.6,hash(id+10.0));
      }

      void main(){
        vec2 uv=vUv;
        float ar=uResolution.x/uResolution.y;
        uv.x*=ar;

        vec3 sky=mix(vec3(0.2,0.22,0.26),vec3(0.08,0.1,0.12),uv.y);

        float cl1=fbm(vec2(uv.x*2.0+uTime*0.05,uv.y*3.0));
        float cl2=fbm(vec2(uv.x*4.0-uTime*0.03,uv.y*2.0+5.0));
        sky=mix(sky,vec3(0.25,0.28,0.3),smoothstep(0.3,0.7,cl1));
        sky=mix(sky,vec3(0.1,0.12,0.15),smoothstep(0.4,0.8,cl2)*0.8);

        float flashTime=uTime*2.0;

        float block=floor(flashTime/10.0);
        float t=fract(flashTime/10.0)*10.0;
        float flash=0.0;

        if(t>8.0 && t<8.5 && hash(vec2(block,0.0))>0.5){
           flash=pow(sin((t-8.0)*20.0),8.0)*hash(vec2(t*10.0,block));
        }

        vec3 ltCol=vec3(0.85,0.9,1.0)*flash*1.5;

        float flashH=hash(vec2(block*1.5,0.0));
        vec2 flashPos=vec2(ar*flashH,0.8);

        sky+=ltCol*exp(-length(uv-flashPos)*2.0);

        float bolt=0.0;
        if(flash>0.1) {
            vec2 bv=uv-flashPos;
            bv.x+=sin(bv.y*15.0)*0.05+sin(bv.y*30.0)*0.02;
            bolt=smoothstep(0.01,0.005,abs(bv.x))*smoothstep(0.0,0.6,flashPos.y-uv.y);
        }
        sky+=vec3(1.0,1.0,1.0)*bolt*flash*2.0;

        float groundLine=0.25;
        float isGround=smoothstep(groundLine+0.01,groundLine,uv.y);
        vec3 groundCol=vec3(0.08,0.09,0.1);

        float puddle=fbm(uv*vec2(10.0,20.0));
        puddle=smoothstep(0.45,0.6,puddle);

        vec2 reflUv=vec2(uv.x, groundLine+(groundLine-uv.y));
        float reflCl=fbm(vec2(reflUv.x*4.0-uTime*0.03,reflUv.y*2.0+5.0));
        vec3 rSky=mix(vec3(0.2,0.22,0.26),vec3(0.1,0.12,0.15),smoothstep(0.4,0.8,reflCl));
        rSky+=ltCol*exp(-length(reflUv-flashPos)*2.0);

        float ripDen=fbm(vec2(uv.x*40.0,uv.y*150.0-uTime*2.0));
        float rx=sin(ripDen*30.0);

        vec3 pCol=mix(rSky*0.5,rSky,rx*0.5+0.5);
        groundCol=mix(groundCol,pCol,puddle*0.8);

        float rain=0.0;
        rain+=rainLayer(uv, 30.0, 15.0, 0.1)*0.2;
        rain+=rainLayer(uv, 20.0, 20.0, 0.12)*0.4;
        rain+=rainLayer(uv, 10.0, 25.0, 0.15)*0.6;

        vec3 rainColor=mix(vec3(0.6,0.65,0.7), vec3(0.9,0.95,1.0), flash);

        vec3 col=mix(sky,groundCol,isGround);
        col+=rainColor*rain;

        col=mix(col,vec3(0.05,0.06,0.08),0.3*(1.0-flash*0.5));

        gl_FragColor=vec4(col,1.0);
      }
    `);
  }

  private buildDesert() {
    this.create2DShaderScene(`
      uniform float uTime;
      uniform vec2 uResolution;
      varying vec2 vUv;

      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float noise(vec2 p){
        vec2 i=floor(p);vec2 f=fract(p);f=f*f*(3.0-2.0*f);
        return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);
      }
      float fbm(vec2 p){float v=0.0,a=0.5;for(int i=0;i<6;i++){v+=a*noise(p);p*=2.0;a*=0.5;}return v;}

      void main(){
        vec2 uv=vUv;
        float ar=uResolution.x/uResolution.y;
        uv.x*=ar;

        vec3 skyHi=vec3(0.15,0.35,0.65);
        vec3 skyLow=vec3(0.75,0.7,0.55);
        vec3 sky=mix(skyLow,skyHi,smoothstep(0.4,1.0,uv.y));

        sky+=vec3(0.9,0.8,0.5)*exp(-(uv.y-0.4)*8.0)*0.15;

        vec2 sunPos=vec2(ar*0.7,0.75);
        float sunD=length(uv-sunPos);
        sky+=vec3(1.0,0.95,0.7)*exp(-sunD*10.0)*0.8;
        sky+=vec3(1.0,0.8,0.4)*exp(-sunD*3.0)*0.3;

        float horizon=0.38;
        float dune1h=sin(uv.x*2.5+0.5)*0.06+fbm(vec2(uv.x*4.0+2.0,0.0))*0.08+horizon;
        float dune2h=sin(uv.x*3.0+1.0)*0.08+fbm(vec2(uv.x*5.0,0.0))*0.1+horizon-0.08;
        float dune3h=sin(uv.x*1.8+2.0)*0.1+fbm(vec2(uv.x*3.0+5.0,0.0))*0.12+horizon-0.15;

        vec3 sandLight=vec3(0.9,0.75,0.5);
        vec3 sandMid=vec3(0.75,0.6,0.38);
        vec3 sandDark=vec3(0.5,0.38,0.22);

        float d1=1.0-smoothstep(dune1h-0.005,dune1h+0.005,uv.y);
        vec3 d1col=mix(sandLight,sandMid,smoothstep(dune1h-0.04,dune1h,uv.y));
        d1col=mix(d1col,vec3(0.7,0.6,0.5),0.3);

        float d2=1.0-smoothstep(dune2h-0.005,dune2h+0.005,uv.y);
        vec3 d2col=mix(sandMid,sandLight,smoothstep(dune2h-0.06,dune2h,uv.y));

        float ripples=sin(uv.x*60.0+fbm(uv*8.0)*5.0)*0.5+0.5;
        d2col=mix(d2col,sandDark,ripples*0.15);

        float d3=1.0-smoothstep(dune3h-0.003,dune3h+0.003,uv.y);
        vec3 d3col=mix(sandDark,sandMid,smoothstep(dune3h-0.08,dune3h,uv.y));
        float ripples2=sin(uv.x*80.0+fbm(uv*12.0)*8.0)*0.5+0.5;
        d3col=mix(d3col,sandLight,ripples2*0.12*smoothstep(dune3h-0.05,dune3h,uv.y));
        d3col*=0.8+0.2*fbm(uv*25.0);

        vec3 col=sky;
        col=mix(col,d1col,d1);
        col=mix(col,d2col,d2);
        col=mix(col,d3col,d3);

        float shimmer=sin(uv.x*30.0+uTime*2.0)*sin(uv.y*50.0+uTime*3.0)*0.5+0.5;
        float hazeMask=exp(-abs(uv.y-horizon)*20.0);
        col=mix(col,vec3(0.85,0.78,0.6),hazeMask*shimmer*0.15);

        gl_FragColor=vec4(col,1.0);
      }
    `);
  }

  private buildBlackHole() {
    this.create2DShaderScene(`
      uniform float uTime;
      uniform vec2 uResolution;
      varying vec2 vUv;

      mat2 rot(float a) {
        float s = sin(a), c = cos(a);
        return mat2(c, -s, s, c);
      }

      void main(){
        vec2 uv = vUv;
        float ar = uResolution.x / uResolution.y;
        uv.x = (uv.x - 0.5) * ar + 0.5;
        vec2 p = uv - 0.5;

        float d = length(p);
        float rEventHorizon = 0.15;

        if(d > rEventHorizon * 0.9) {
          float distortion = 1.0 - (rEventHorizon * 0.5) / d;
          p *= distortion;
        }

        d = length(p);

        float blackHole = smoothstep(rEventHorizon + 0.01, rEventHorizon, d);

        vec3 rd = normalize(vec3(p, 1.0));
        vec3 ro = vec3(0.0, 0.5, -2.5);

        vec3 n = normalize(vec3(0.0, 1.0, 0.4));
        float t = -dot(ro, n) / dot(rd, n);
        vec3 hit = ro + rd * t;

        float diskCol = 0.0;
        vec3 glowCol = vec3(0.0);

        if(t > 0.0) {
          float distToCenter = length(hit);
          if(distToCenter > rEventHorizon * 1.5 && distToCenter < rEventHorizon * 6.0) {
            float angle = atan(hit.z, hit.x);

            float swirl = sin(distToCenter * 20.0 - uTime * 5.0 + angle * 4.0);
            float bands = fract(distToCenter * 8.0 - uTime * 2.0);

            diskCol = smoothstep(0.0, 0.2, bands) * smoothstep(1.0, 0.8, bands);
            diskCol *= swirl * 0.5 + 0.5;

            diskCol *= smoothstep(rEventHorizon * 6.0, rEventHorizon * 4.0, distToCenter);
            diskCol *= smoothstep(rEventHorizon * 1.5, rEventHorizon * 2.5, distToCenter);

            float doppler = smoothstep(-1.0, 1.0, cos(angle));
            diskCol *= mix(0.4, 1.6, doppler);
          }
        }

        float jet = 0.0;
        vec2 jetP = p;
        jetP.x *= 4.0;
        float jetDist = length(jetP);
        float jetA = atan(jetP.x, jetP.y);

        if (d > rEventHorizon) {
           float pulse = sin(uTime * 10.0 - abs(p.y) * 20.0) * 0.5 + 0.5;
           jet = exp(-jetDist * 15.0) * pulse * (1.0 - smoothstep(0.0, 0.8, abs(p.y)));
        }

        float photonRing = smoothstep(rEventHorizon + 0.05, rEventHorizon, d) * smoothstep(rEventHorizon - 0.01, rEventHorizon + 0.01, d);
        photonRing = pow(photonRing, 4.0) * 2.0;

        vec3 baseDiskColor = vec3(1.0, 0.4, 0.1);
        vec3 hotDiskColor = vec3(1.0, 0.9, 0.5);
        vec3 jetColor = vec3(0.2, 0.5, 1.0);

        vec3 col = vec3(0.0);

        col += mix(baseDiskColor, hotDiskColor, smoothstep(0.0, 1.0, diskCol)) * diskCol;
        col += jetColor * jet * 2.0;
        col += hotDiskColor * photonRing;

        col *= (1.0 - blackHole);

        float dust = fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
        col += vec3(1.0) * smoothstep(0.99, 1.0, dust) * (1.0 - blackHole) * 0.3;

        gl_FragColor = vec4(col, 1.0);
      }
    `);
  }

  private buildEarth() {
    this.create2DShaderScene(`
      uniform float uTime;
      uniform vec2 uResolution;
      varying vec2 vUv;

      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float noise(vec2 p){
        vec2 i=floor(p);vec2 f=fract(p);f=f*f*(3.0-2.0*f);
        return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);
      }
      float fbm(vec2 p){float v=0.0,a=0.5;mat2 m=mat2(1.6,1.2,-1.2,1.6);for(int i=0;i<6;i++){v+=a*noise(p);p=m*p;a*=0.5;}return v;}

      float sphere(vec2 p, out vec3 n) {
        float r = length(p);
        if (r > 1.0) return 0.0;
        n = vec3(p, sqrt(1.0 - r*r));
        return 1.0;
      }

      void main(){
        vec2 uv = vUv;
        float ar = uResolution.x / uResolution.y;
        uv.x = (uv.x - 0.5) * ar + 0.5;
        vec2 p = (uv - 0.5) * 2.5;

        vec3 lightDir = normalize(vec3(1.0, 0.5, 0.5));

        vec3 n;
        float isSphere = sphere(p, n);

        vec3 col = vec3(0.0);

        if (isSphere > 0.0) {

          float theta = atan(n.x, n.z);
          float phi = asin(n.y);

          vec2 sphereUv = vec2(theta / 3.14159, phi / (3.14159 / 2.0));

          sphereUv.x += uTime * 0.05;

          float terrain = fbm(sphereUv * 3.0);
          float oceanMask = smoothstep(0.4, 0.6, terrain);

          vec3 deepOcean = vec3(0.02, 0.1, 0.3);
          vec3 shallowWater = vec3(0.05, 0.4, 0.6);
          vec3 landColor = vec3(0.1, 0.4, 0.15);
          vec3 desertColor = vec3(0.6, 0.5, 0.3);

          vec3 ocean = mix(deepOcean, shallowWater, fbm(sphereUv * 10.0 + uTime * 0.1));

          float latitudeMask = abs(phi) / (3.14159 / 2.0);
          vec3 surface = mix(landColor, desertColor, fbm(sphereUv * 5.0 + 10.0));

          float ice = smoothstep(0.7, 0.9, latitudeMask + fbm(sphereUv * 10.0) * 0.2);
          surface = mix(surface, vec3(0.9, 0.95, 1.0), ice);

          col = mix(ocean, surface, oceanMask);

          float cl = fbm(vec2(sphereUv.x * 4.0 + uTime * 0.02, sphereUv.y * 5.0) + fbm(sphereUv * 15.0) * 0.5);
          float cloudMask = smoothstep(0.5, 0.8, cl);
          col = mix(col, vec3(0.9, 0.95, 1.0), cloudMask * 0.8);

          float diffuse = max(0.0, dot(n, lightDir));

          float terminator = smoothstep(-0.2, 0.1, dot(n, lightDir));

          vec3 twilight = vec3(0.8, 0.3, 0.1) * smoothstep(-0.2, 0.1, dot(n, lightDir)) * smoothstep(0.2, -0.1, dot(n, lightDir));

          col = col * diffuse + twilight;

          if (diffuse < 0.1 && oceanMask > 0.0 && ice < 0.1) {
             float lights = fbm(sphereUv * 40.0);
             col += vec3(1.0, 0.8, 0.5) * smoothstep(0.7, 1.0, lights) * (1.0 - cloudMask) * 1.5;
          }

        } else {

          float d = length(p);
          float atmo = exp(-(d - 1.0) * 12.0) * smoothstep(1.5, 1.0, d);

          float sunSide = dot(normalize(vec3(p, 0.0)), lightDir);
          atmo *= smoothstep(-0.5, 0.5, sunSide);

          col += vec3(0.1, 0.4, 0.8) * atmo;

          float stars = fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
          col += vec3(1.0) * smoothstep(0.995, 1.0, stars) * (1.0 - atmo);
        }

        gl_FragColor = vec4(col, 1.0);
      }
    `);
  }

  private buildMars() {
    this.create2DShaderScene(`
      uniform float uTime;
      uniform vec2 uResolution;
      varying vec2 vUv;

      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float noise(vec2 p){
        vec2 i=floor(p);vec2 f=fract(p);f=f*f*(3.0-2.0*f);
        return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);
      }
      float fbm(vec2 p){float v=0.0,a=0.5;mat2 m=mat2(1.6,1.2,-1.2,1.6);for(int i=0;i<7;i++){v+=a*noise(p);p=m*p;a*=0.5;}return v;}

      float sphere(vec2 p, out vec3 n) {
        float r = length(p);
        if (r > 1.0) return 0.0;
        n = vec3(p, sqrt(1.0 - r*r));
        return 1.0;
      }

      void main(){
        vec2 uv = vUv;
        float ar = uResolution.x / uResolution.y;
        uv.x = (uv.x - 0.5) * ar + 0.5;
        vec2 p = (uv - 0.5) * 2.5;

        vec3 lightDir = normalize(vec3(0.8, 0.2, 1.0));

        vec3 n;
        float isSphere = sphere(p, n);

        vec3 col = vec3(0.0);

        if (isSphere > 0.0) {
          float theta = atan(n.x, n.z);
          float phi = asin(n.y);

          vec2 sphereUv = vec2(theta / 3.14159, phi / (3.14159 / 2.0));
          sphereUv.x += uTime * 0.03;

          float craterBase = noise(sphereUv * 15.0);
          float craterRim = smoothstep(0.4, 0.5, craterBase) * smoothstep(0.6, 0.5, craterBase);
          float craters = craterRim * 0.5 - smoothstep(0.5, 0.8, craterBase) * 0.3;

          float terrain = fbm(sphereUv * 4.0) + craters;

          vec3 darkRust = vec3(0.35, 0.15, 0.05);
          vec3 brightDust = vec3(0.8, 0.35, 0.15);
          vec3 rockyGrey = vec3(0.4, 0.25, 0.15);

          vec3 surface = mix(darkRust, brightDust, smoothstep(0.2, 0.8, terrain));

          float rockNoise = fbm(sphereUv * 20.0);
          surface = mix(surface, rockyGrey, rockNoise * 0.3);

          float latitudeMask = abs(phi) / (3.14159 / 2.0);
          float ice = smoothstep(0.85, 0.95, latitudeMask + fbm(sphereUv * 15.0) * 0.1);
          surface = mix(surface, vec3(0.9, 0.85, 0.8), ice);

          vec2 eps = vec2(0.01, 0.0);
          float hX = fbm((sphereUv + eps.xy) * 4.0) - fbm((sphereUv - eps.xy) * 4.0);
          float hY = fbm((sphereUv + eps.yx) * 4.0) - fbm((sphereUv - eps.yx) * 4.0);
          vec3 bumpNormal = normalize(n + vec3(hX, hY, 0.0) * 0.5);

          float diffuse = max(0.0, dot(bumpNormal, lightDir));

          float rim = 1.0 - max(0.0, dot(n, vec3(0.0, 0.0, 1.0)));
          rim = smoothstep(0.6, 1.0, rim);

          col = surface * diffuse + vec3(0.9, 0.4, 0.2) * rim * diffuse * 0.5;

        } else {

          float d = length(p);
          float atmo = exp(-(d - 1.0) * 20.0) * smoothstep(1.2, 1.0, d);

          float sunSide = dot(normalize(vec3(p, 0.0)), lightDir);
          atmo *= smoothstep(-0.2, 0.8, sunSide);

          col += vec3(0.7, 0.3, 0.1) * atmo;

          float stars = fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
          col += vec3(1.0) * smoothstep(0.995, 1.0, stars) * (1.0 - atmo);
        }

        gl_FragColor = vec4(col, 1.0);
      }
    `);
  }

  private buildGasGiant() {
    this.create2DShaderScene(`
      uniform float uTime;
      uniform vec2 uResolution;
      varying vec2 vUv;

      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float noise(vec2 p){
        vec2 i=floor(p);vec2 f=fract(p);f=f*f*(3.0-2.0*f);
        return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);
      }
      float fbm(vec2 p){float v=0.0,a=0.5;mat2 m=mat2(1.6,1.2,-1.2,1.6);for(int i=0;i<6;i++){v+=a*noise(p);p=m*p;a*=0.5;}return v;}

      float sphere(vec2 p, out vec3 n) {
        float r = length(p);
        if (r > 1.0) return 0.0;
        n = vec3(p, sqrt(1.0 - r*r));
        return 1.0;
      }

      void main(){
        vec2 uv = vUv;
        float ar = uResolution.x / uResolution.y;
        uv.x = (uv.x - 0.5) * ar + 0.5;
        vec2 p = (uv - 0.5) * 2.5;

        float tilt = 0.4;
        mat2 rotTilt = mat2(cos(tilt), -sin(tilt), sin(tilt), cos(tilt));
        p.xy *= rotTilt;

        vec3 lightDir = normalize(vec3(0.8, 0.4, 0.5));

        vec3 n;
        float isSphere = sphere(p, n);

        vec3 col = vec3(0.0);

        float d = length(vec2(p.x, p.y * 3.0));

        float ringZ = -p.y * 3.0;

        float isRingBack = step(1.5, d) * step(d, 3.5) * step(0.0, ringZ);
        float isRingFront = step(1.5, d) * step(d, 3.5) * step(ringZ, 0.0);

        float ringNoise = fbm(vec2(d * 20.0, 0.0));
        float ringBands = sin(d * 50.0) * 0.5 + 0.5;
        float ringAlpha = (ringNoise * 0.5 + ringBands * 0.5) * smoothstep(1.5, 1.8, d) * smoothstep(3.5, 3.2, d);

        vec3 ringColor = mix(vec3(0.6, 0.5, 0.4), vec3(0.8, 0.7, 0.6), ringNoise);

        if (isRingBack > 0.0 && isSphere == 0.0) {
           col += ringColor * ringAlpha * 0.8;
        }

        if (isSphere > 0.0) {
          float theta = atan(n.x, n.z);
          float phi = asin(n.y);

          vec2 sphereUv = vec2(theta / 3.14159, phi / (3.14159 / 2.0));
          sphereUv.x += uTime * 0.05;

          float bands = fbm(vec2(sphereUv.y * 10.0, sphereUv.x * 2.0 + uTime * 0.02));
          float turb = fbm(sphereUv * 8.0 + bands * 2.0);

          float storm = fbm(sphereUv * 15.0 - uTime * 0.1);

          vec3 col1 = vec3(0.9, 0.8, 0.6);
          vec3 col2 = vec3(0.7, 0.4, 0.2);
          vec3 col3 = vec3(0.5, 0.2, 0.1);

          vec3 surface = mix(col1, col2, smoothstep(0.2, 0.8, bands));
          surface = mix(surface, col3, smoothstep(0.6, 1.0, turb));

          vec2 stormPos = vec2(0.2, -0.3);
          float stormDist = length(vec2(sphereUv.x - stormPos.x, (sphereUv.y - stormPos.y) * 2.0));
          float isStorm = smoothstep(0.3, 0.0, stormDist);
          surface = mix(surface, vec3(0.8, 0.3, 0.1), isStorm * storm);

          float diffuse = max(0.0, dot(n, lightDir));

          float ringShadow = 1.0;
          if (n.y < 0.2 && n.y > -0.2 && n.x > 0.0) {
              ringShadow = mix(1.0, 0.4, smoothstep(0.2, 0.0, abs(n.y)));
          }

          col = surface * diffuse * ringShadow;

        }

        if (isRingFront > 0.0) {

           float shadowMask = 1.0;

           if (p.x < 0.0 && d < 2.5) {
               shadowMask = mix(1.0, 0.1, smoothstep(-0.5, -1.0, p.x));
           }

           vec3 frontRing = ringColor * ringAlpha * shadowMask;

           col = mix(col, frontRing, ringAlpha * isRingFront);
        }

        if (isSphere == 0.0 && isRingBack == 0.0 && isRingFront == 0.0) {
          float stars = fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
          col += vec3(1.0) * smoothstep(0.995, 1.0, stars);
        } else if (isSphere == 0.0 && isRingFront > 0.0) {

           float stars = fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
           col += vec3(1.0) * smoothstep(0.995, 1.0, stars) * (1.0 - ringAlpha);
        }

        gl_FragColor = vec4(col, 1.0);
      }
    `);
  }

  public setTemplate(templateId: string | null) {
    this.activeTemplateId = templateId;
    this.clearScene();
    if (!templateId) {
      this.setScene(this.activeSceneIndex);
      return;
    }

    const baseId = templateId.replace('-ascii', '');

    const emojis: Record<string, string> = {
      laugh: "😂", heart: "❤️", rofl: "🤣", thumbs_up: "👍",
      cry: "😭", pray: "🙏", kiss: "😘", hearts: "🥰",
      heart_eyes: "😍", smile: "😊", fire: "🔥", sparkles: "✨"
    };

    if (emojis[baseId]) {
      this.buildEmojiTemplate(emojis[baseId]);
    } else {
      switch (baseId) {
        case 'cat': this.buildCatTemplate(); break;
        case 'dog': this.buildDogTemplate(); break;
        case 'tree': this.buildTreeTemplate(); break;
        default: this.setScene(this.activeSceneIndex); break;
      }
    }
  }

  private buildEmojiTemplate(emoji: string) {
    const group = new THREE.Group();

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, 512, 512);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = '400px sans-serif';
      ctx.fillText(emoji, 256, 256);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;

    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      side: THREE.DoubleSide,
      color: 0xffffff,
      alphaTest: 0.1
    });

    const geometry = new THREE.PlaneGeometry(4, 4);
    const mesh = new THREE.Mesh(geometry, material);
    group.add(mesh);

    this.camera.position.set(0, 0, 8);
    this.camera.lookAt(0, 0, 0);
    this.templateGroup = group;
    this.scene.add(group);
    this.objects.push(group);
  }

  private buildTreeTemplate() {
    const group = new THREE.Group();

    const trunkMat = new THREE.MeshPhongMaterial({ color: 0x4a2f1a });
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.45, 3.5, 16), trunkMat);
    trunk.position.set(0, -1.5, 0);
    group.add(trunk);

    const mats = [
      new THREE.MeshPhongMaterial({ color: 0x33aa33 }),
      new THREE.MeshPhongMaterial({ color: 0x228822 }),
      new THREE.MeshPhongMaterial({ color: 0x44cc44 }),
    ];

    const clusters = [
      { pos: [0, 1.2, 0], r: 1.8, mat: 0 },
      { pos: [0, 2.4, 0], r: 1.4, mat: 1 },
      { pos: [-1.3, 0.8, 0.3], r: 1.3, mat: 2 },
      { pos: [1.3, 0.9, -0.2], r: 1.2, mat: 0 },
      { pos: [-0.8, 0.2, 0.9], r: 1.0, mat: 1 },
      { pos: [0.9, 0.3, 0.8], r: 0.9, mat: 2 },
      { pos: [0.2, 1.0, -1.0], r: 1.1, mat: 1 },
      { pos: [-0.3, 3.0, 0.2], r: 0.8, mat: 2 },
    ];

    clusters.forEach((c) => {
      const mesh = new THREE.Mesh(new THREE.SphereGeometry(c.r, 28, 28), mats[c.mat]);
      mesh.position.set(c.pos[0], c.pos[1], c.pos[2]);
      group.add(mesh);
    });

    this.camera.position.set(0, 0.5, 8);
    this.camera.lookAt(0, 0.5, 0);
    this.templateGroup = group;
    this.scene.add(group);
    this.objects.push(group);
  }

  private buildCatTemplate() {
    const group = new THREE.Group();
    const bodyMat = new THREE.MeshPhongMaterial({ color: 0xffaa44 });

    const head = new THREE.Mesh(new THREE.SphereGeometry(2, 32, 32), bodyMat);
    group.add(head);

    const earMat = new THREE.MeshPhongMaterial({ color: 0xee9933 });
    const earL = new THREE.Mesh(new THREE.ConeGeometry(0.7, 1.4, 16), earMat);
    earL.position.set(-1.1, 1.8, 0);
    earL.rotation.z = 0.25;
    group.add(earL);
    const earR = new THREE.Mesh(new THREE.ConeGeometry(0.7, 1.4, 16), earMat);
    earR.position.set(1.1, 1.8, 0);
    earR.rotation.z = -0.25;
    group.add(earR);

    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x00ff66 });
    const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.3, 16, 16), eyeMat);
    eyeL.position.set(-0.65, 0.4, 1.7);
    group.add(eyeL);
    const eyeR = new THREE.Mesh(new THREE.SphereGeometry(0.3, 16, 16), eyeMat);
    eyeR.position.set(0.65, 0.4, 1.7);
    group.add(eyeR);

    const noseMat = new THREE.MeshBasicMaterial({ color: 0xff4466 });
    const nose = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 12), noseMat);
    nose.position.set(0, -0.15, 1.9);
    group.add(nose);

    this.camera.position.set(0, 0, 6);
    this.camera.lookAt(0, 0, 0);
    this.templateGroup = group;
    this.scene.add(group);
    this.objects.push(group);
  }

  private buildDogTemplate() {
    const group = new THREE.Group();
    const bodyMat = new THREE.MeshPhongMaterial({ color: 0xcc8844 });

    const head = new THREE.Mesh(new THREE.SphereGeometry(2, 32, 32), bodyMat);
    group.add(head);

    const snoutMat = new THREE.MeshPhongMaterial({ color: 0xddaa66 });
    const snout = new THREE.Mesh(new THREE.SphereGeometry(1.0, 24, 24), snoutMat);
    snout.position.set(0, -0.6, 1.2);
    snout.scale.set(1.0, 0.6, 0.8);
    group.add(snout);

    const earMat = new THREE.MeshPhongMaterial({ color: 0x885522 });
    const earL = new THREE.Mesh(new THREE.SphereGeometry(0.8, 16, 16), earMat);
    earL.position.set(-1.5, 0.8, -0.3);
    earL.scale.set(0.5, 1.2, 0.5);
    group.add(earL);
    const earR = new THREE.Mesh(new THREE.SphereGeometry(0.8, 16, 16), earMat);
    earR.position.set(1.5, 0.8, -0.3);
    earR.scale.set(0.5, 1.2, 0.5);
    group.add(earR);

    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x44ccff });
    const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.28, 16, 16), eyeMat);
    eyeL.position.set(-0.6, 0.4, 1.75);
    group.add(eyeL);
    const eyeR = new THREE.Mesh(new THREE.SphereGeometry(0.28, 16, 16), eyeMat);
    eyeR.position.set(0.6, 0.4, 1.75);
    group.add(eyeR);

    const noseMat = new THREE.MeshPhongMaterial({ color: 0x222222 });
    const nose = new THREE.Mesh(new THREE.SphereGeometry(0.3, 12, 12), noseMat);
    nose.position.set(0, -0.3, 1.95);
    group.add(nose);

    this.camera.position.set(0, 0, 6);
    this.camera.lookAt(0, 0, 0);
    this.templateGroup = group;
    this.scene.add(group);
    this.objects.push(group);
  }

}