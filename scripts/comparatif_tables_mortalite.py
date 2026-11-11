import pandas as pd, numpy as np, math
# --- tables ---
def tg(sheet):
    t=pd.read_excel('data/TGF05-TGH05.xls',sheet_name=sheet,header=None)
    yrs=[int(y) for y in t.iloc[1,1:]]
    return {y:t.iloc[2:,i+1].astype(float).values for i,y in enumerate(yrs)}  # index = age
TGF,TGH=tg('TGF05'),tg('TGH05')
def insee(sheet):
    d=pd.read_excel('data/morta_niv_2016.xls',sheet_name=sheet,header=None)
    r=d.iloc[8:]; out=[]
    for _,x in r.iterrows():
        try: a=int(float(x[0]))
        except: break
        if a!=len(out): break
        out.append(float(x[2]))
    out.append(0.0); return np.array(out)
IH,IF=insee(0),insee(1)
def gen_surv(tab,by,age):   # lx for a person born by
    L=tab[by]; return L
def mk(L):
    def l(a):
        if a>=len(L)-1: return 0.0
        i=int(math.floor(a));f=a-i
        return L[i]+(L[i+1]-L[i])*f
    return l
def S(l,age,t):
    d=l(age); return l(age+t)/d if d>0 else 0
def factor(lives,i,g,kind,rev=1.0):
    v=(1+g)/(1+i); res=0
    for k in range(1,12*80+1):
        t=k/12
        s=[S(l,a,t) for l,a in lives]
        if len(s)==1: w=s[0]
        else:
            last=s[0]+s[1]-s[0]*s[1]
            w=last if kind=='duh' else rev*last+(1-rev)*s[0]*s[1]
        res+=w*v**t/12
    return res
def ev(lives):
    return sum(( (lambda s:(s[0]+s[1]-s[0]*s[1]) if len(s)>1 else s[0])([S(l,a,(k-.5)/12) for l,a in lives]))/12 for k in range(1,12*80+1))
scen={
 'A. V6 actuelle (gén. 1950 pour tous)':[(mk(list(TGF[1950])),76),(mk(list(TGH[1950])),80)],
 'B. TGF05/TGH05 génération réelle (F 1950, H 1946)':[(mk(list(TGF[1950])),76),(mk(list(TGH[1946])),80)],
 'C. INSEE période 2012-16 (ensemble)':[(mk(list(IF)),76),(mk(list(IH)),80)],
}
VL,rent,bq=400000,1104,60000
print('Notaire: ev 16.4 | DUH 110097 | capital 229903 | rente ~1383/mois')
for name,lives in scen.items():
    e=ev(lives)
    for dec in (.20,.40):
        a=factor(lives,.02,0,'duh'); duh=rent*12*(1-dec)*a
        fa=factor(lives,.02,.015,'ann'); fa0=factor(lives,.02,0,'ann')
        vo=VL-duh
        print(f"{name} | ev {e:.1f} | décote {int(dec*100)}% | a={a:.2f} DUH {duh:,.0f} ({duh/VL:.0%}) | rente idx1,5% {(vo-bq)/fa/12:,.0f} | rente sans idx {(vo-bq)/fa0/12:,.0f}")
# calibrage notaire : coefficient implicite
print('coeff implicite notaire ≈',229903/(272174/16.4))
for name,lives in scen.items(): print(name,'coeff a(2%,sans idx)=',round(factor(lives,.02,0,'duh'),2))
