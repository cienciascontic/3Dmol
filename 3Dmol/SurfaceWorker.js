/*
//Hackish way to create webworker (independent of $3Dmol namespace) within minified file
//Had to hard-code uglify-js minified version of worker string in order to work with closure compiler...
$3Dmol.workerString = function(){

    self.onmessage = function(oEvent) {
        var obj = oEvent.data;
        var type = obj.type;
        if (type < 0) // sending atom data, initialize
        {
            self.atomData = obj.atoms;
            self.volume = obj.volume;
            self.ps = new ProteinSurface();
        } else {
            var ps = self.ps;
            ps.initparm(obj.expandedExtent, (type == 1) ? false : true, self.volume);
            ps.fillvoxels(self.atomData, obj.extendedAtoms);
            ps.buildboundary();
            if (type === 4 || type === 2) {
                ps.fastdistancemap();
                ps.boundingatom(false);
                ps.fillvoxelswaals(self.atomData, obj.extendedAtoms);    
            }        
            ps.marchingcube(type);
            var VandF = ps.getFacesAndVertices(obj.atomsToShow);
            self.postMessage(VandF);
        }
    };
    
}.toString().replace(/(^.*?\{|\}$)/g, "");
$3Dmol.workerString += ";var Vector3=function(x,y,z){this.x=x||0,this.y=y||0,this.z=z||0};Vector3.prototype={constructor:Vector3,copy:function(v){return this.x=v.x,this.y=v.y,this.z=v.z,this},multiplyScalar:function(s){return this.x*=s,this.y*=s,this.z*=s,this}}"
$3Dmol.workerString += ";var ISDONE=2";
$3Dmol.workerString += ",ProteinSurface=" + $3Dmol.ProteinSurface.toString().replace(/$3Dmol.MarchingCube./g, "");
$3Dmol.workerString += ",march=" + $3Dmol.MarchingCube.march.toString().replace(/$3Dmol./g, "");
$3Dmol.workerString += ",laplacianSmooth=" + $3Dmol.MarchingCube.laplacianSmooth.toString();

$3Dmol.workerString += ",edgeTable=new Uint32Array([" + $3Dmol.MarchingCube.edgeTable.toString() + "])";

$3Dmol.workerString += ",triTable=[";

for (var i = 0, il = $3Dmol.MarchingCube.triTable.length; i < il - 1; i++)
    $3Dmol.workerString += "[" + $3Dmol.MarchingCube.triTable[i].toString() + "],";

$3Dmol.workerString += "[]]";
*/

//TODO: Make this dynamic
//Otherwise, must uncomment and run the above with 3Dmol-min.js, and cut and paste below everytime ProteinSurface or MarchingCube modified
$3Dmol.workerString = 'self.onmessage=function(oEvent){var obj=oEvent.data,type=obj.type;if(0>type)self.atomData=obj.atoms,self.volume=obj.volume,self.ps=new ProteinSurface;else{var ps=self.ps;ps.initparm(obj.expandedExtent,1==type?!1:!0,self.volume),ps.fillvoxels(self.atomData,obj.extendedAtoms),ps.buildboundary(),(4===type||2===type)&&(ps.fastdistancemap(),ps.boundingatom(!1),ps.fillvoxelswaals(self.atomData,obj.extendedAtoms)),ps.marchingcube(type);var VandF=ps.getFacesAndVertices(obj.atomsToShow);self.postMessage(VandF)}};var Vector3=function(x,y,z){this.x=x||0,this.y=y||0,this.z=z||0};Vector3.prototype={constructor:Vector3,copy:function(v){return this.x=v.x,this.y=v.y,this.z=v.z,this},multiplyScalar:function(s){return this.x*=s,this.y*=s,this.z*=s,this}};var ISDONE=2,ProteinSurface=function (){var faces,verts,origextent,INOUT=1,ISDONE=2,ISBOUND=4,ptranx=0,ptrany=0,ptranz=0,probeRadius=1.4,defaultScaleFactor=2,scaleFactor=defaultScaleFactor,pHeight=0,pWidth=0,pLength=0,cutRadius=0,vpBits=null,vpDistance=null,vpAtomID=null,pminx=0,pminy=0,pminz=0,pmaxx=0,pmaxy=0,pmaxz=0,vdwRadii={H:1.2,Li:1.82,Na:2.27,K:2.75,C:1.7,N:1.55,O:1.52,F:1.47,P:1.8,S:1.8,CL:1.75,BR:1.85,SE:1.9,ZN:1.39,CU:1.4,NI:1.63,X:2},getVDWIndex=function(atom){return atom.elem&&"undefined"!=typeof vdwRadii[atom.elem]?atom.elem:"X"},depty={},widxz={},nb=[new Int32Array([1,0,0]),new Int32Array([-1,0,0]),new Int32Array([0,1,0]),new Int32Array([0,-1,0]),new Int32Array([0,0,1]),new Int32Array([0,0,-1]),new Int32Array([1,1,0]),new Int32Array([1,-1,0]),new Int32Array([-1,1,0]),new Int32Array([-1,-1,0]),new Int32Array([1,0,1]),new Int32Array([1,0,-1]),new Int32Array([-1,0,1]),new Int32Array([-1,0,-1]),new Int32Array([0,1,1]),new Int32Array([0,1,-1]),new Int32Array([0,-1,1]),new Int32Array([0,-1,-1]),new Int32Array([1,1,1]),new Int32Array([1,1,-1]),new Int32Array([1,-1,1]),new Int32Array([-1,1,1]),new Int32Array([1,-1,-1]),new Int32Array([-1,-1,1]),new Int32Array([-1,1,-1]),new Int32Array([-1,-1,-1])];this.getFacesAndVertices=function(atomlist){var i,il,atomsToShow={};for(i=0,il=atomlist.length;il>i;i++)atomsToShow[atomlist[i]]=!0;var vertices=verts;for(i=0,il=vertices.length;il>i;i++)vertices[i].x=vertices[i].x/scaleFactor-ptranx,vertices[i].y=vertices[i].y/scaleFactor-ptrany,vertices[i].z=vertices[i].z/scaleFactor-ptranz;var finalfaces=[];for(i=0,il=faces.length;il>i;i+=3){var fa=faces[i],fb=faces[i+1],fc=faces[i+2],a=vertices[fa].atomid,b=vertices[fb].atomid,c=vertices[fc].atomid,which=a;if(which>b&&(which=b),which>c&&(which=c),atomsToShow[which]){{vertices[faces[i]],vertices[faces[i+1]],vertices[faces[i+2]]}fa!==fb&&fb!==fc&&fa!==fc&&(finalfaces.push(fa),finalfaces.push(fb),finalfaces.push(fc))}}return vpBits=null,vpDistance=null,vpAtomID=null,{vertices:vertices,faces:finalfaces}},this.initparm=function(extent,btype,volume){volume>1e6&&(scaleFactor=defaultScaleFactor/2);var margin=1/scaleFactor*5.5;origextent=extent,pminx=extent[0][0],pmaxx=extent[1][0],pminy=extent[0][1],pmaxy=extent[1][1],pminz=extent[0][2],pmaxz=extent[1][2],btype?(pminx-=probeRadius+margin,pminy-=probeRadius+margin,pminz-=probeRadius+margin,pmaxx+=probeRadius+margin,pmaxy+=probeRadius+margin,pmaxz+=probeRadius+margin):(pminx-=margin,pminy-=margin,pminz-=margin,pmaxx+=margin,pmaxy+=margin,pmaxz+=margin),pminx=Math.floor(pminx*scaleFactor)/scaleFactor,pminy=Math.floor(pminy*scaleFactor)/scaleFactor,pminz=Math.floor(pminz*scaleFactor)/scaleFactor,pmaxx=Math.ceil(pmaxx*scaleFactor)/scaleFactor,pmaxy=Math.ceil(pmaxy*scaleFactor)/scaleFactor,pmaxz=Math.ceil(pmaxz*scaleFactor)/scaleFactor,ptranx=-pminx,ptrany=-pminy,ptranz=-pminz,pLength=Math.ceil(scaleFactor*(pmaxx-pminx))+1,pWidth=Math.ceil(scaleFactor*(pmaxy-pminy))+1,pHeight=Math.ceil(scaleFactor*(pmaxz-pminz))+1,this.boundingatom(btype),cutRadius=probeRadius*scaleFactor,vpBits=new Uint8Array(pLength*pWidth*pHeight),vpDistance=new Float64Array(pLength*pWidth*pHeight),vpAtomID=new Int32Array(pLength*pWidth*pHeight)},this.boundingatom=function(btype){var txz,tdept,sradius,tradius=[];flagradius=btype;for(var i in vdwRadii)if(vdwRadii.hasOwnProperty(i)){var r=vdwRadii[i];for(tradius[i]=btype?(r+probeRadius)*scaleFactor+.5:r*scaleFactor+.5,sradius=tradius[i]*tradius[i],widxz[i]=Math.floor(tradius[i])+1,depty[i]=new Int32Array(widxz[i]*widxz[i]),indx=0,j=0;j<widxz[i];j++)for(k=0;k<widxz[i];k++)txz=j*j+k*k,txz>sradius?depty[i][indx]=-1:(tdept=Math.sqrt(sradius-txz),depty[i][indx]=Math.floor(tdept)),indx++}},this.fillvoxels=function(atoms,atomlist){var i,il;for(i=0,il=vpBits.length;il>i;i++)vpBits[i]=0,vpDistance[i]=-1,vpAtomID[i]=-1;for(i in atomlist){var atom=atoms[atomlist[i]];void 0!==atom&&this.fillAtom(atom,atoms)}for(i=0,il=vpBits.length;il>i;i++)vpBits[i]&INOUT&&(vpBits[i]|=ISDONE)},this.fillAtom=function(atom,atoms){var cx,cy,cz,ox,oy,oz,mi,mj,mk,i,j,k,si,sj,sk,ii,jj,kk,n;cx=Math.floor(.5+scaleFactor*(atom.x+ptranx)),cy=Math.floor(.5+scaleFactor*(atom.y+ptrany)),cz=Math.floor(.5+scaleFactor*(atom.z+ptranz));var at=getVDWIndex(atom),nind=0,pWH=pWidth*pHeight;for(i=0,n=widxz[at];n>i;i++)for(j=0;n>j;j++){if(-1!=depty[at][nind])for(ii=-1;2>ii;ii++)for(jj=-1;2>jj;jj++)for(kk=-1;2>kk;kk++)if(0!==ii&&0!==jj&&0!==kk)for(mi=ii*i,mk=kk*j,k=0;k<=depty[at][nind];k++)if(mj=k*jj,si=cx+mi,sj=cy+mj,sk=cz+mk,!(0>si||0>sj||0>sk||si>=pLength||sj>=pWidth||sk>=pHeight)){var index=si*pWH+sj*pHeight+sk;if(vpBits[index]&INOUT){var atom2=atoms[vpAtomID[index]];ox=Math.floor(.5+scaleFactor*(atom2.x+ptranx)),oy=Math.floor(.5+scaleFactor*(atom2.y+ptrany)),oz=Math.floor(.5+scaleFactor*(atom2.z+ptranz)),ox*ox+oy*oy+oz*oz>mi*mi+mj*mj+mk*mk&&(vpAtomID[index]=atom.serial)}else vpBits[index]|=INOUT,vpAtomID[index]=atom.serial}nind++}},this.fillvoxelswaals=function(atoms,atomlist){var i,il;for(i=0,il=vpBits.length;il>i;i++)vpBits[i]&=~ISDONE;for(i in atomlist){var atom=atoms[atomlist[i]];void 0!==atom&&this.fillAtomWaals(atom,atoms)}},this.fillAtomWaals=function(atom,atoms){var cx,cy,cz,ox,oy,oz,mi,mj,mk,si,sj,sk,i,j,k,ii,jj,kk,n,nind=0;cx=Math.floor(.5+scaleFactor*(atom.x+ptranx)),cy=Math.floor(.5+scaleFactor*(atom.y+ptrany)),cz=Math.floor(.5+scaleFactor*(atom.z+ptranz));var at=getVDWIndex(atom),pWH=pWidth*pHeight;for(i=0,n=widxz[at];n>i;i++)for(j=0;n>j;j++){if(-1!=depty[at][nind])for(ii=-1;2>ii;ii++)for(jj=-1;2>jj;jj++)for(kk=-1;2>kk;kk++)if(0!==ii&&0!==jj&&0!==kk)for(mi=ii*i,mk=kk*j,k=0;k<=depty[at][nind];k++)if(mj=k*jj,si=cx+mi,sj=cy+mj,sk=cz+mk,!(0>si||0>sj||0>sk||si>=pLength||sj>=pWidth||sk>=pHeight)){var index=si*pWH+sj*pHeight+sk;if(vpBits[index]&ISDONE){var atom2=atoms[vpAtomID[index]];ox=Math.floor(.5+scaleFactor*(atom2.x+ptranx)),oy=Math.floor(.5+scaleFactor*(atom2.y+ptrany)),oz=Math.floor(.5+scaleFactor*(atom2.z+ptranz)),ox*ox+oy*oy+oz*oz>mi*mi+mj*mj+mk*mk&&(vpAtomID[index]=atom.serial)}else vpBits[index]|=ISDONE,vpAtomID[index]=atom.serial}nind++}},this.buildboundary=function(){var pWH=pWidth*pHeight;for(i=0;pLength>i;i++)for(j=0;pHeight>j;j++)for(k=0;pWidth>k;k++){var index=i*pWH+k*pHeight+j;if(vpBits[index]&INOUT)for(var ii=0;26>ii;){var ti=i+nb[ii][0],tj=j+nb[ii][2],tk=k+nb[ii][1];if(ti>-1&&pLength>ti&&tk>-1&&pWidth>tk&&tj>-1&&pHeight>tj&&!(vpBits[ti*pWH+tk*pHeight+tj]&INOUT)){vpBits[index]|=ISBOUND;break}ii++}}};var PointGrid=function(length,width,height){var data=new Int32Array(length*width*height*3);this.set=function(x,y,z,pt){var index=3*((x*width+y)*height+z);data[index]=pt.ix,data[index+1]=pt.iy,data[index+2]=pt.iz},this.get=function(x,y,z){var index=3*((x*width+y)*height+z);return{ix:data[index],iy:data[index+1],iz:data[index+2]}}};this.fastdistancemap=function(){var i,j,k,n,index,boundPoint=new PointGrid(pLength,pWidth,pHeight),pWH=pWidth*pHeight,cutRSq=cutRadius*cutRadius,inarray=[],outarray=[];for(i=0;pLength>i;i++)for(j=0;pWidth>j;j++)for(k=0;pHeight>k;k++)if(index=i*pWH+j*pHeight+k,vpBits[index]&=~ISDONE,vpBits[index]&INOUT&&vpBits[index]&ISBOUND){var triple={ix:i,iy:j,iz:k};boundPoint.set(i,j,k,triple),inarray.push(triple),vpDistance[index]=0,vpBits[index]|=ISDONE,vpBits[index]&=~ISBOUND}do for(outarray=this.fastoneshell(inarray,boundPoint),inarray=[],i=0,n=outarray.length;n>i;i++)index=pWH*outarray[i].ix+pHeight*outarray[i].iy+outarray[i].iz,vpBits[index]&=~ISBOUND,vpDistance[index]<=1.0404*cutRSq&&inarray.push({ix:outarray[i].ix,iy:outarray[i].iy,iz:outarray[i].iz});while(0!==inarray.length);inarray=[],outarray=[],boundPoint=null;var cutsf=scaleFactor-.5;0>cutsf&&(cutsf=0);var cutoff=cutRSq-.5/(.1+cutsf);for(i=0;pLength>i;i++)for(j=0;pWidth>j;j++)for(k=0;pHeight>k;k++)index=i*pWH+j*pHeight+k,vpBits[index]&=~ISBOUND,vpBits[index]&INOUT&&(!(vpBits[index]&ISDONE)||vpBits[index]&ISDONE&&vpDistance[index]>=cutoff)&&(vpBits[index]|=ISBOUND)},this.fastoneshell=function(inarray,boundPoint){var tx,ty,tz,dx,dy,dz,i,j,n,square,bp,index,outarray=[];if(0===inarray.length)return outarray;tnv={ix:-1,iy:-1,iz:-1};var pWH=pWidth*pHeight;for(i=0,n=inarray.length;n>i;i++)for(tx=inarray[i].ix,ty=inarray[i].iy,tz=inarray[i].iz,bp=boundPoint.get(tx,ty,tz),j=0;6>j;j++)tnv.ix=tx+nb[j][0],tnv.iy=ty+nb[j][1],tnv.iz=tz+nb[j][2],tnv.ix<pLength&&tnv.ix>-1&&tnv.iy<pWidth&&tnv.iy>-1&&tnv.iz<pHeight&&tnv.iz>-1&&(index=tnv.ix*pWH+pHeight*tnv.iy+tnv.iz,vpBits[index]&INOUT&&!(vpBits[index]&ISDONE)?(boundPoint.set(tnv.ix,tnv.iy,tz+nb[j][2],bp),dx=tnv.ix-bp.ix,dy=tnv.iy-bp.iy,dz=tnv.iz-bp.iz,square=dx*dx+dy*dy+dz*dz,vpDistance[index]=square,vpBits[index]|=ISDONE,vpBits[index]|=ISBOUND,outarray.push({ix:tnv.ix,iy:tnv.iy,iz:tnv.iz})):vpBits[index]&INOUT&&vpBits[index]&ISDONE&&(dx=tnv.ix-bp.ix,dy=tnv.iy-bp.iy,dz=tnv.iz-bp.iz,square=dx*dx+dy*dy+dz*dz,square<vpDistance[index]&&(boundPoint.set(tnv.ix,tnv.iy,tnv.iz,bp),vpDistance[index]=square,vpBits[index]&ISBOUND||(vpBits[index]|=ISBOUND,outarray.push({ix:tnv.ix,iy:tnv.iy,iz:tnv.iz})))));for(i=0,n=inarray.length;n>i;i++)for(tx=inarray[i].ix,ty=inarray[i].iy,tz=inarray[i].iz,bp=boundPoint.get(tx,ty,tz),j=6;18>j;j++)tnv.ix=tx+nb[j][0],tnv.iy=ty+nb[j][1],tnv.iz=tz+nb[j][2],tnv.ix<pLength&&tnv.ix>-1&&tnv.iy<pWidth&&tnv.iy>-1&&tnv.iz<pHeight&&tnv.iz>-1&&(index=tnv.ix*pWH+pHeight*tnv.iy+tnv.iz,vpBits[index]&INOUT&&!(vpBits[index]&ISDONE)?(boundPoint.set(tnv.ix,tnv.iy,tz+nb[j][2],bp),dx=tnv.ix-bp.ix,dy=tnv.iy-bp.iy,dz=tnv.iz-bp.iz,square=dx*dx+dy*dy+dz*dz,vpDistance[index]=square,vpBits[index]|=ISDONE,vpBits[index]|=ISBOUND,outarray.push({ix:tnv.ix,iy:tnv.iy,iz:tnv.iz})):vpBits[index]&INOUT&&vpBits[index]&ISDONE&&(dx=tnv.ix-bp.ix,dy=tnv.iy-bp.iy,dz=tnv.iz-bp.iz,square=dx*dx+dy*dy+dz*dz,square<vpDistance[index]&&(boundPoint.set(tnv.ix,tnv.iy,tnv.iz,bp),vpDistance[index]=square,vpBits[index]&ISBOUND||(vpBits[index]|=ISBOUND,outarray.push({ix:tnv.ix,iy:tnv.iy,iz:tnv.iz})))));for(i=0,n=inarray.length;n>i;i++)for(tx=inarray[i].ix,ty=inarray[i].iy,tz=inarray[i].iz,bp=boundPoint.get(tx,ty,tz),j=18;26>j;j++)tnv.ix=tx+nb[j][0],tnv.iy=ty+nb[j][1],tnv.iz=tz+nb[j][2],tnv.ix<pLength&&tnv.ix>-1&&tnv.iy<pWidth&&tnv.iy>-1&&tnv.iz<pHeight&&tnv.iz>-1&&(index=tnv.ix*pWH+pHeight*tnv.iy+tnv.iz,vpBits[index]&INOUT&&!(vpBits[index]&ISDONE)?(boundPoint.set(tnv.ix,tnv.iy,tz+nb[j][2],bp),dx=tnv.ix-bp.ix,dy=tnv.iy-bp.iy,dz=tnv.iz-bp.iz,square=dx*dx+dy*dy+dz*dz,vpDistance[index]=square,vpBits[index]|=ISDONE,vpBits[index]|=ISBOUND,outarray.push({ix:tnv.ix,iy:tnv.iy,iz:tnv.iz})):vpBits[index]&INOUT&&vpBits[index]&ISDONE&&(dx=tnv.ix-bp.ix,dy=tnv.iy-bp.iy,dz=tnv.iz-bp.iz,square=dx*dx+dy*dy+dz*dz,square<vpDistance[index]&&(boundPoint.set(tnv.ix,tnv.iy,tnv.iz,bp),vpDistance[index]=square,vpBits[index]&ISBOUND||(vpBits[index]|=ISBOUND,outarray.push({ix:tnv.ix,iy:tnv.iy,iz:tnv.iz})))));return outarray},this.marchingcubeinit=function(stype){for(var i=0,lim=vpBits.length;lim>i;i++)1==stype?vpBits[i]&=~ISBOUND:4==stype?(vpBits[i]&=~ISDONE,vpBits[i]&ISBOUND&&(vpBits[i]|=ISDONE),vpBits[i]&=~ISBOUND):2==stype?vpBits[i]&ISBOUND&&vpBits[i]&ISDONE?vpBits[i]&=~ISBOUND:vpBits[i]&ISBOUND&&!(vpBits[i]&ISDONE)&&(vpBits[i]|=ISDONE):3==stype&&(vpBits[i]&=~ISBOUND)};this.marchingcube=function(stype){this.marchingcubeinit(stype),verts=[],faces=[],march(vpBits,verts,faces,{smooth:1,nX:pLength,nY:pWidth,nZ:pHeight});for(var pWH=pWidth*pHeight,i=0,vlen=verts.length;vlen>i;i++)verts[i].atomid=vpAtomID[verts[i].x*pWH+pHeight*verts[i].y+verts[i].z];laplacianSmooth(1,verts,faces)}},march=function (data,verts,faces,spec){var i,il,fulltable=!!spec.fulltable,origin=spec.hasOwnProperty("origin")&&spec.origin.hasOwnProperty("x")?spec.origin:{x:0,y:0,z:0},voxel=!!spec.voxel,nX=spec.nX||0,nY=spec.nY||0,nZ=spec.nZ||0,scale=spec.scale||1,unitCube=new Vector3(1,1,1).multiplyScalar(scale),vertnums=new Int32Array(nX*nY*nZ);for(i=0,il=vertnums.length;il>i;++i)vertnums[i]=-1;var getVertex=function(i,j,k,code,p1,p2){var pt=new Vector3;pt.copy(origin);var val1=!!(code&1<<p1),val2=!!(code&1<<p2),p=p1;!val1&&val2&&(p=p2),1&p&&k++,2&p&&j++,4&p&&i++,pt.x+=unitCube.x*i,pt.y+=unitCube.y*j,pt.z+=unitCube.z*k;var index=(nY*i+j)*nZ+k;return voxel?(verts.push(pt),verts.length-1):(vertnums[index]<0&&(vertnums[index]=verts.length,verts.push(pt)),vertnums[index])},intersects=new Int32Array(12),etable=fulltable?edgeTable2:edgeTable,tritable=fulltable?triTable2:triTable;for(i=0;nX-1>i;++i)for(var j=0;nY-1>j;++j)for(var k=0;nZ-1>k;++k){for(var code=0,p=0;8>p;++p){var index=(nY*(i+((4&p)>>2))+j+((2&p)>>1))*nZ+k+(1&p),val=!!(data[index]&ISDONE);code|=val<<p}if(0!==code&&255!==code){var ecode=etable[code];if(0!==ecode){var ttable=tritable[code];1&ecode&&(intersects[0]=getVertex(i,j,k,code,0,1)),2&ecode&&(intersects[1]=getVertex(i,j,k,code,1,3)),4&ecode&&(intersects[2]=getVertex(i,j,k,code,3,2)),8&ecode&&(intersects[3]=getVertex(i,j,k,code,2,0)),16&ecode&&(intersects[4]=getVertex(i,j,k,code,4,5)),32&ecode&&(intersects[5]=getVertex(i,j,k,code,5,7)),64&ecode&&(intersects[6]=getVertex(i,j,k,code,7,6)),128&ecode&&(intersects[7]=getVertex(i,j,k,code,6,4)),256&ecode&&(intersects[8]=getVertex(i,j,k,code,0,4)),512&ecode&&(intersects[9]=getVertex(i,j,k,code,1,5)),1024&ecode&&(intersects[10]=getVertex(i,j,k,code,3,7)),2048&ecode&&(intersects[11]=getVertex(i,j,k,code,2,6));for(var t=0;t<ttable.length;t+=3){var a=intersects[ttable[t]],b=intersects[ttable[t+1]],c=intersects[ttable[t+2]];voxel&&t>=3&&(verts.push(verts[a]),a=verts.length-1,verts.push(verts[b]),b=verts.length-1,verts.push(verts[c]),c=verts.length-1),faces.push(a),faces.push(b),faces.push(c)}}}}},laplacianSmooth=function (numiter,verts,faces){var i,il,j,jl,k,tps=new Array(verts.length);for(i=0,il=verts.length;il>i;i++)tps[i]={x:0,y:0,z:0};var flagvert,vertdeg=new Array(20);for(i=0;20>i;i++)vertdeg[i]=new Array(verts.length);for(i=0,il=verts.length;il>i;i++)vertdeg[0][i]=0;for(i=0,il=faces.length/3;il>i;i++){var aoffset=3*i,boffset=3*i+1,coffset=3*i+2;for(flagvert=!0,j=0,jl=vertdeg[0][faces[aoffset]];jl>j;j++)if(faces[boffset]==vertdeg[j+1][faces[aoffset]]){flagvert=!1;break}for(flagvert&&(vertdeg[0][faces[aoffset]]++,vertdeg[vertdeg[0][faces[aoffset]]][faces[aoffset]]=faces[boffset]),flagvert=!0,j=0,jl=vertdeg[0][faces[aoffset]];jl>j;j++)if(faces[coffset]==vertdeg[j+1][faces[aoffset]]){flagvert=!1;break}for(flagvert&&(vertdeg[0][faces[aoffset]]++,vertdeg[vertdeg[0][faces[aoffset]]][faces[aoffset]]=faces[coffset]),flagvert=!0,j=0,jl=vertdeg[0][faces[boffset]];jl>j;j++)if(faces[aoffset]==vertdeg[j+1][faces[boffset]]){flagvert=!1;break}for(flagvert&&(vertdeg[0][faces[boffset]]++,vertdeg[vertdeg[0][faces[boffset]]][faces[boffset]]=faces[aoffset]),flagvert=!0,j=0,jl=vertdeg[0][faces[boffset]];jl>j;j++)if(faces[coffset]==vertdeg[j+1][faces[boffset]]){flagvert=!1;break}for(flagvert&&(vertdeg[0][faces[boffset]]++,vertdeg[vertdeg[0][faces[boffset]]][faces[boffset]]=faces[coffset]),flagvert=!0,j=0;j<vertdeg[0][faces[coffset]];j++)if(faces[aoffset]==vertdeg[j+1][faces[coffset]]){flagvert=!1;break}for(flagvert&&(vertdeg[0][faces[coffset]]++,vertdeg[vertdeg[0][faces[coffset]]][faces[coffset]]=faces[aoffset]),flagvert=!0,j=0,jl=vertdeg[0][faces[coffset]];jl>j;j++)if(faces[boffset]==vertdeg[j+1][faces[coffset]]){flagvert=!1;break}flagvert&&(vertdeg[0][faces[coffset]]++,vertdeg[vertdeg[0][faces[coffset]]][faces[coffset]]=faces[boffset])}var wt=1,wt2=.5;for(k=0;numiter>k;k++){for(i=0,il=verts.length;il>i;i++)if(vertdeg[0][i]<3)tps[i].x=verts[i].x,tps[i].y=verts[i].y,tps[i].z=verts[i].z;else if(3==vertdeg[0][i]||4==vertdeg[0][i]){for(tps[i].x=0,tps[i].y=0,tps[i].z=0,j=0,jl=vertdeg[0][i];jl>j;j++)tps[i].x+=verts[vertdeg[j+1][i]].x,tps[i].y+=verts[vertdeg[j+1][i]].y,tps[i].z+=verts[vertdeg[j+1][i]].z;tps[i].x+=wt2*verts[i].x,tps[i].y+=wt2*verts[i].y,tps[i].z+=wt2*verts[i].z,tps[i].x/=wt2+vertdeg[0][i],tps[i].y/=wt2+vertdeg[0][i],tps[i].z/=wt2+vertdeg[0][i]}else{for(tps[i].x=0,tps[i].y=0,tps[i].z=0,j=0,jl=vertdeg[0][i];jl>j;j++)tps[i].x+=verts[vertdeg[j+1][i]].x,tps[i].y+=verts[vertdeg[j+1][i]].y,tps[i].z+=verts[vertdeg[j+1][i]].z;tps[i].x+=wt*verts[i].x,tps[i].y+=wt*verts[i].y,tps[i].z+=wt*verts[i].z,tps[i].x/=wt+vertdeg[0][i],tps[i].y/=wt+vertdeg[0][i],tps[i].z/=wt+vertdeg[0][i]}for(i=0,il=verts.length;il>i;i++)verts[i].x=tps[i].x,verts[i].y=tps[i].y,verts[i].z=tps[i].z}},edgeTable=new Uint32Array([0,0,0,0,0,0,0,2816,0,0,0,1792,0,3328,3584,3840,0,0,0,138,0,21,0,134,0,0,0,652,0,2067,3865,3600,0,0,0,42,0,0,0,294,0,0,21,28,0,3875,1049,3360,0,168,162,170,0,645,2475,2210,0,687,293,172,4010,3747,3497,3232,0,0,0,0,0,69,0,900,0,0,0,1792,138,131,1608,1920,0,81,0,2074,84,85,84,86,0,81,0,3676,330,1105,1881,1616,0,0,0,42,0,69,0,502,0,0,21,3580,138,2035,1273,1520,2816,104,2337,106,840,581,367,102,2816,3695,3429,3180,1898,1635,1385,1120,0,0,0,0,0,0,0,3910,0,0,69,588,42,2083,41,2880,0,0,0,1722,0,2293,4095,3830,0,255,757,764,2538,2291,3065,2800,0,0,81,338,0,3925,1119,3414,84,855,85,340,2130,2899,89,2384,1792,712,194,1162,4036,3781,3535,3270,708,719,197,204,3018,2755,2505,2240,0,0,0,0,168,420,168,1958,162,162,676,2988,170,163,680,928,3328,3096,3328,3642,52,53,1855,1590,2340,2111,2869,2620,298,51,825,560,3584,3584,3090,3482,1668,1941,1183,1430,146,2975,2069,2460,154,915,153,400,3840,3592,3329,3082,1796,1541,1295,1030,2818,2575,2309,2060,778,515,265,0]),triTable=[[],[],[],[],[],[],[],[11,9,8],[],[],[],[8,10,9],[],[10,8,11],[9,11,10],[8,10,9,8,11,10],[],[],[],[1,7,3],[],[4,2,0],[],[2,1,7],[],[],[],[2,7,3,2,9,7],[],[1,4,11,1,0,4],[3,8,0,11,9,4,11,10,9],[4,11,9,11,10,9],[],[],[],[5,3,1],[],[],[],[2,5,8,2,1,5],[],[],[2,4,0],[3,2,4],[],[0,9,1,8,10,5,8,11,10],[3,4,0,3,10,4],[5,8,10,8,11,10],[],[3,5,7],[7,1,5],[1,7,3,1,5,7],[],[9,2,0,9,7,2],[0,3,8,1,7,11,1,5,7],[11,1,7,1,5,7],[],[9,1,0,5,3,2,5,7,3],[8,2,5,8,0,2],[2,5,3,5,7,3],[3,9,1,3,8,9,7,11,10,7,10,5],[9,1,0,10,7,11,10,5,7],[3,8,0,7,10,5,7,11,10],[11,5,7,11,10,5],[],[],[],[],[],[0,6,2],[],[7,2,9,7,9,8],[],[],[],[8,10,9],[7,1,3],[7,1,0],[6,9,3,6,10,9],[7,10,8,10,9,8],[],[6,0,4],[],[11,1,4,11,3,1],[2,4,6],[2,0,4,2,4,6],[2,4,6],[1,4,2,4,6,2],[],[6,0,4],[],[2,11,3,6,9,4,6,10,9],[8,6,1,8,1,3],[10,0,6,0,4,6],[8,0,3,9,6,10,9,4,6],[10,4,6,10,9,4],[],[],[],[5,3,1],[],[0,6,2],[],[7,4,8,5,2,1,5,6,2],[],[],[2,4,0],[7,4,8,2,11,3,10,5,6],[7,1,3],[5,6,10,0,9,1,8,7,4],[5,6,10,7,0,3,7,4,0],[10,5,6,4,8,7],[9,11,8],[3,5,6],[0,5,11,0,11,8],[6,3,5,3,1,5],[3,9,6,3,8,9],[9,6,0,6,2,0],[0,3,8,2,5,6,2,1,5],[1,6,2,1,5,6],[9,11,8],[1,0,9,6,10,5,11,3,2],[6,10,5,2,8,0,2,11,8],[3,2,11,10,5,6],[10,5,6,9,3,8,9,1,3],[0,9,1,5,6,10],[8,0,3,10,5,6],[10,5,6],[],[],[],[],[],[],[],[1,10,2,9,11,6,9,8,11],[],[],[6,0,2],[3,6,9,3,2,6],[3,5,1],[0,5,1,0,11,5],[0,3,5],[6,9,11,9,8,11],[],[],[],[4,5,9,7,1,10,7,3,1],[],[11,6,7,2,4,5,2,0,4],[11,6,7,8,0,3,1,10,2,9,4,5],[6,7,11,1,10,2,9,4,5],[],[4,1,0,4,5,1,6,7,3,6,3,2],[9,4,5,0,6,7,0,2,6],[4,5,9,6,3,2,6,7,3],[6,7,11,5,3,8,5,1,3],[6,7,11,4,1,0,4,5,1],[4,5,9,3,8,0,11,6,7],[9,4,5,7,11,6],[],[],[0,6,4],[8,6,4,8,1,6],[],[0,10,2,0,9,10,4,8,11,4,11,6],[10,2,1,6,0,3,6,4,0],[10,2,1,11,4,8,11,6,4],[4,2,6],[1,0,9,2,4,8,2,6,4],[2,4,0,2,6,4],[8,2,4,2,6,4],[11,4,1,11,6,4],[0,9,1,4,11,6,4,8,11],[3,6,0,6,4,0],[8,6,4,8,11,6],[10,8,9],[6,3,9,6,7,3],[6,7,1],[10,7,1,7,3,1],[7,11,6,8,10,2,8,9,10],[11,6,7,10,0,9,10,2,0],[2,1,10,7,11,6,8,0,3],[1,10,2,6,7,11],[7,2,6,7,9,2],[1,0,9,3,6,7,3,2,6],[7,0,6,0,2,6],[2,7,3,2,6,7],[7,11,6,3,9,1,3,8,9],[9,1,0,11,6,7],[0,3,8,11,6,7],[11,6,7],[],[],[],[],[5,3,7],[8,5,2,8,7,5],[5,3,7],[1,10,2,5,8,7,5,9,8],[1,7,5],[1,7,5],[9,2,7,9,7,5],[11,3,2,8,5,9,8,7,5],[1,3,7,1,7,5],[0,7,1,7,5,1],[9,3,5,3,7,5],[9,7,5,9,8,7],[8,10,11],[3,4,10,3,10,11],[8,10,11],[5,9,4,1,11,3,1,10,11],[2,4,5],[5,2,4,2,0,4],[0,3,8,5,9,4,10,2,1],[2,1,10,9,4,5],[2,8,5,2,11,8],[3,2,11,1,4,5,1,0,4],[9,4,5,8,2,11,8,0,2],[11,3,2,9,4,5],[8,5,3,5,1,3],[5,0,4,5,1,0],[3,8,0,4,5,9],[9,4,5],[11,9,10],[11,9,10],[1,11,4,1,10,11],[8,7,4,11,1,10,11,3,1],[2,7,9,2,9,10],[4,8,7,0,10,2,0,9,10],[2,1,10,0,7,4,0,3,7],[10,2,1,8,7,4],[1,7,4],[3,2,11,4,8,7,9,1,0],[11,4,2,4,0,2],[2,11,3,7,4,8],[4,1,7,1,3,7],[1,0,9,8,7,4],[3,4,0,3,7,4],[8,7,4],[8,9,10,8,10,11],[3,9,11,9,10,11],[0,10,8,10,11,8],[10,3,1,10,11,3],[2,8,10,8,9,10],[9,2,0,9,10,2],[8,0,3,1,10,2],[10,2,1],[1,11,9,11,8,9],[11,3,2,0,9,1],[11,0,2,11,8,0],[11,3,2],[8,1,3,8,9,1],[9,1,0],[8,0,3],[]]';

$3Dmol.SurfaceWorker = window.URL.createObjectURL(new Blob([$3Dmol.workerString],{type: 'text/javascript'}));

$3Dmol['workerString'] = $3Dmol.workerString;
$3Dmol['SurfaceWorker'] = $3Dmol.SurfaceWorker;
