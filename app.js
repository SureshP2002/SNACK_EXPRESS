// importing [express] module
const express=require('express');
const app=express();

//importing express-handlebars[template engines]
const exhbs=require('express-handlebars');
const handlebars=exhbs.create({extname:".hbs"})
app.engine('hbs',handlebars.engine);
app.set("view engine","hbs");

//importing [body-parser] module
const bodyparser=require('body-parser');
app.use(bodyparser.urlencoded({extended:true}));
app.use(express.json());

//for displaying [static] content
app.use(express.static('public'));


//importing [mysql] (db) module
const mysql=require('mysql');

//make db connection to mysql
const con=mysql.createPool({
    host:'127.0.0.1',
    user:'root',
    port:'3306',
    password:'Suresh1304@',
    database:'snacks'

})

/*checking [db] connection;
con.getConnection((err,connection)=>{
    if(err)
    throw err;
    console.log("DB connected")
})*/

//request from main(/)
app.get('/',(req,res)=>{
  res.render('items')
})


// --------------------------------------------------------------request from icecream-------------------------------------------------------------------------
app.get('/icecream',(req,res)=>{
  con.getConnection((err,connection)=>{
    if(err)
    throw err;
    connection.query("select * from icecreams ",(err,rows)=>{
      connection.release();
      if(err)
      throw err;
      else
      res.render('icecreams',{rows})
    })
  })
})

//request from ordericecream
app.get('/ordericecream',(req,res)=>{
  con.getConnection((err,connection)=>{
    if(err)
    throw err;
    let id=req.query.id;
    connection.query("select * from icecreams where id=?",[id],(err,rows)=>{
      if(err)throw err;
      else {
      
      let name=rows[0].name;
      let cost=rows[0].cost;
      connection.query("insert into orders(name,cost) values(?,?)",[name,cost],(err,rows)=>{
        connection.release();
        if(err)
        throw err;
        else 
        res.redirect('/icecream')
      })
    }
    })
  })
})
//----------------------------------------------------------------------------------------------------------------------------------------------


//---------------------------------------------------------------request from fruits------------------------------------------------------------

app.get('/fruits',(req,res)=>{
  con.getConnection((err,connection)=>{
    if(err)
    throw err;
    connection.query("select * from fruits ",(err,rows)=>{
      connection.release();
      if(err)
      throw err;
      else
      res.render('fruits',{rows})
    })
  })
})

//request from orderfruits
app.get('/orderfruits',(req,res)=>{
  con.getConnection((err,connection)=>{
    if(err)
    throw err;
    let id=req.query.id;
    connection.query("select * from fruits where id=?",[id],(err,rows)=>{
      if(err)throw err;
      else {
      
      let name=rows[0].name;
      let cost=rows[0].cost;
      connection.query("insert into orders(name,cost) values(?,?)",[name,cost],(err,rows)=>{
        connection.release();
        
        if(err)
        throw err;
        else 
        res.redirect('/fruits')
      })
    }
    })
  })
})

//--------------------------------------------------------------request from cakes---------------------------------------------------------------------------------


//-----------------------------------------------------------------request from cake---------------------------------------------------------------

app.get('/cakes',(req,res)=>{
  con.getConnection((err,connection)=>{
    if(err)
    throw err;
    connection.query("select * from cake ",(err,rows)=>{
      connection.release();
      if(err)
      throw err;
      else
      res.render('cakes',{rows})
    })
  })
})

//request from ordercake
app.get('/ordercake',(req,res)=>{
  con.getConnection((err,connection)=>{
    if(err)
    throw err;
    let id=req.query.id;
    connection.query("select * from cake where id=?",[id],(err,rows)=>{
      if(err)throw err;
      else {
      let name=rows[0].name;
      let cost=rows[0].cost;
      connection.query("insert into orders(name,cost) values(?,?)",[name,cost],(err,rows)=>{
        connection.release();
        if(err)
        throw err;
        else 
        res.redirect('/cakes')
      })
    }
    })
  })
})
//-----------------------------------------------------------------------------------------------------------------------------------------------


//------------------------------------------------------------------request from puffs-----------------------------------------------------------------

app.get('/puffs',(req,res)=>{
  con.getConnection((err,connection)=>{
    if(err)
    throw err;
    connection.query("select * from puffs ",(err,rows)=>{
      connection.release();
      if(err)
      throw err;
      else
      res.render('puffs',{rows})
    })
  })
})

//request from orderpuffs
app.get('/orderpuffs',(req,res)=>{
  con.getConnection((err,connection)=>{
    if(err)
    throw err;
    let id=req.query.id;
    connection.query("select * from puffs where id=?",[id],(err,rows)=>{
      if(err)throw err;
      else {
      let name=rows[0].name;
      let cost=rows[0].cost;
      
      connection.query("insert into orders(name,cost) values(?,?)",[name,cost],(err,rows)=>{
        connection.release();
        if(err)
        throw err;
        else 
        res.redirect('/puffs')
      })
    }
    })
  })
})
//------------------------------------------------------------------------------------------------------------------------------






//-----------------------------------------------------------------request from Ordered items------------------------------------------------------------

app.get('/ordereditems',(req,res)=>{
  con.getConnection((err,connection)=>{
    if(err)
    throw err
    connection.query("select name,count(name) as quantity,sum(cost) as cost from orders group by name ;",(err,row1)=>{
      
      if(err)
      throw err;
      else 
      {
        connection.query("select count(name) as cnt ,sum(cost) as cos from orders ",(err,row2)=>{
          connection.release();
          if(err)
          throw err;
          else
          {
           res.render('Orders',{row1,row2})
          }
        })
        
      }
    
    })
  })
})
//--deleting order-------
app.get('/remove',(req,res)=>{
  con.getConnection((err,connection)=>{
    if(err)throw err;
    else{
      let name=req.query.name;
      
      connection.query(`delete from orders where name like ?`,[name],(err,rows)=>{
        connection.release();
        if(err) throw err;
        else{
          res.redirect('/ordereditems')
        }
      })
    }
  })
})
//-------------------------------------------------------------------------------------------------------------------------------------------------
   


//--------------------------------------------------------------------Confirm  order request-------------------------------------------------------------------------------

app.get('/confirm',(req,res)=>{
    res.render('confirm')
})

//after confirmation we need to truncate the orders table and store the current order list in admins table
app.post('/confirmed',(req,res)=>{
  let name=req.body.name;
  let address=req.body.address;
  let ph=req.body.ph;
 con.getConnection((err,connection)=>{
    if(err)throw err;
    connection.query("select name,count(name) as quantity,sum(cost) as cost from orders group by name ;",(err,row1)=>{
      if(err)throw err;
      else{
        connection.query('select count(name) as Total_quan,sum(cost) as Total_cost from orders;',(err,row2)=>{
          if(err)throw err;
          else{
            connection.query("truncate table orders",(err,row3)=>{
              if(err)throw err;
              else{
                var q=`create table admin.${name}( person varchar(100),address varchar(100),phone BIGINT,id int primary key auto_increment,items varchar(30),quantity int, cost int,totalq int,totalc int);`;
                connection.query(q,(err,row4)=>{
                  if(err)throw err;
                  else 
                  {
                  for(let i=0;i<row1.length; i++)
                  {
                    var n=row1[i].name;
                    var q=row1[i].quantity;
                    var c=row1[i].cost;
                    var tq=row2[0].Total_quan;
                    var tc=row2[0].Total_cost;
                    connection.query(`insert into admin.${name}(person,address,phone,items,quantity,cost,totalq,totalc) values(?,?,?,?,?,?,?,?)`,[name,address,ph,n,q,c,tq,tc],(err,row5)=>{
                      if(err)throw err;
                      
                    })
                  }
                  connection.release();
                  res.redirect('/');
                 
                  }
                })
              }
            })
          }
        })
      }
    })
  })
})
//------------------------------------------------------------------------------------------------------------------------------------------------



//---------------------------------------------------------------admin request--------------------------------------------------------------------------------------
app.get('/admin',(req,res)=>{
   res.render('adminlogin');
})

//----shop page request--------
app.use('/shop',(req,res)=>{
  const email=req.body.email
  const password=req.body.pass;
  con.getConnection((err,connection)=>{
    if(err)throw err;
    else{
      connection.query('select * from checking.checktable',(err,rows)=>{
        connection.release();
        if(err)throw err;
        else{
          let e=rows[0].email;
          let p=rows[0].pass;
          if(email==undefined||e==email&&p==password)
          {
            res.render('shop')
          }
          else{
            res.redirect('/admin');
          }
          
        }
      })
    }
  })
  
  
})
//----Orders page request from shop page------
app.use('/orders',(req,res)=>{
  con.getConnection((err,connection)=>{
    if(err)
    throw err;
    connection.query("show tables from admin",(err,rows)=>{
      let arr;
      if(err)
      throw err;
      else{
       arr=[];
       for(let i=0;i<rows.length;i++){
          var qq= rows[i].Tables_in_admin;
          
        connection.query(`select * from admin.${qq}`,(err,rows1)=>{
        if(err)throw err;
        else{
          
          arr.push(rows1);
        }
    
        })
      }
     connection.release();
    res.render('admins',{arr})
      }
    })
  })
})
//-----------product page request from shop----------
app.get('/product', async (req,res)=>{
  con.getConnection((err,connection)=>{
    if(err)throw err;
    else{
      connection.query('show tables from snacks',(err,rows)=>{
        if(err)throw err
        else{
          let lis=[];
          for(let i=0;i<rows.length;i++){
            if(rows[i].Tables_in_snacks!="orders"){
            let tbname=rows[i].Tables_in_snacks;
           
            connection.query(`select * from snacks.${tbname}`,(err,rows1)=>{
              if(err)throw err;
              else{
               for(let i=0;i<rows1.length;i++)
               {
                rows1[i].tbn=tbname;
               }
                
                lis.push(rows1)
              }
              
            })
            }
          }
          connection.release();
          
         res.render('adminorder',{lis})

        }
      })
    }
  })
})
//-------------------------------------------------------------------------------------------------------------------------------------------


//--------------------------------------------CRUD OPERATION FOR ADMIN-----------------------------------------------------------------------
//-----------------------------DELETE tables from admin(list of order)------------
app.get('/delete',(req,res)=>{
  let id=req.query.id;
  con.getConnection((err,connection)=>{
    if(err)throw err;
    else{
      connection.query(`drop table admin.${id} `,(err,rows)=>{
        connection.release();
        if(err) throw err;
        else{
        res.redirect('/shop');
        }
      })
    }
  })
})
//-----------------------delete items from particular table-------------------------
app.get('/dltrow',(req,res)=>{

 
  con.getConnection((err,connection)=>{
    let id=req.query.id;
    let tb=req.query.it;

    if(err)throw err;
    else{
      connection.query(`delete from ${tb} where id=${id}`,(err,rows1)=>{
        connection.release();
        if(err)throw err;
        else{
          res.redirect('/shop')
        }
      })
    }
  })
})

//---------------------add item in particular table-------------
app.use('/additem',(req,res)=>{
  let tb=req.query.name;
  res.render('additem',{tb})

})
app.use('/added',(req,res)=>{
  
  con.getConnection((err,connection)=>{
  let item=req.body.item;
   let cost=req.body.cost;
   let tbname=req.body.tb;
    if(err)throw err;
    else{
      connection.query(`insert into snacks.${tbname}(name,cost) values(?,?)`,[item,cost],(err,rows)=>{
        connection.release();
        if(err)throw err;
        else
        {
          res.redirect('/shop')
        }
      })
    }
  })
})

//-------------------------------editing item------------------------------
app.use('/uptrow',(req,res)=>{
 con.getConnection((err,connection)=>{
  let id=req.query.id;
  let tbname=req.query.it;
  if(err)throw err;
  connection.query(`select * from snacks.${tbname} where id=${id}`,(err,rows)=>{
    connection.release();
    if(err)throw err;
    else{
      rows[0].tbn=tbname
      
     res.render('edititem',{rows})
    }

  })
 })
})
//--------update-------------------
app.post('/edited',(req,res)=>{
 
  con.getConnection((err,connection)=>{
    let id=req.body.id;
    let name=req.body.item;
    let cost=req.body.cost;
    let tbname=req.body.tb;
    
    if(err)throw err;
    else{
      connection.query(`update snacks.${tbname} set name=?,cost=? where id=?`,[name,cost,id],(err,rows)=>{
        connection.release()
        if(err)throw err;
        else
        {
          
           res.redirect('/shop')
        }
      })
    }
  })
  
})



//----------------------------------listening the server port--------------------------------------------------------------------------------
app.listen(5000)

