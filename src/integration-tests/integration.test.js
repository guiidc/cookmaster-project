const chai = require('chai');
const chaiHttp = require('chai-http');
const sinon = require('sinon');
const { expect } = require('chai');
const mongoConnection = require('../../configs/connection');
const { getConnectionMock }= require('../../configs/connectionMock');
const app = require('../api/app');

chai.use(chaiHttp);

describe('Teste da rota de LOGIN', () => {
  let dbMock;
  const userExample = { email: 'reogerin@rogerin.com', password: 123 }

  before(async () => {
    dbMock = await getConnectionMock();
    sinon.stub(mongoConnection, 'getConnection').resolves(dbMock);
  });

  after(() => {
    mongoConnection.getConnection.restore();
  })

  describe('Quando não é passado usuário ou senha', () => {
    let response;
    before(async () =>{
     response = await chai.request(app).post('/login').send({});
    })
    it('Deve retornar um erro de status 401', () => {
      expect(response).to.have.status(401);
    });
    it('Objeto da resposta possui a propriedade message', () => {
      expect(response.body).to.have.property('message');
    });
    it('Retorna a mensagem "Incorrect username or password"', () => {
      expect(response.body.message).to.eql('All fields must be filled');
    });
    it('Deve retornar um objeto', () => {
      expect(response.body).to.be.an('object');
    });
  });

  describe('Quando é passado login/senha incorreta ou usuário não existe', () => {
    let response;

    before(async () => {
      response = await chai.request(app).post('/login').send(userExample);
    })
    it('Retorna stauts 401', async () => {
      expect(response).to.have.status(401);
    })
    it('Retorna um objeto', async () => {
      expect(response).to.be.an('object');
    })
    it('Retorna mensagem "Incorrect username or password"', async () => {
      expect(response.body.message).to.eql('Incorrect username or password');
    })
  })

  describe('Quando usuário é logado com sucesso', () => {
    let response;

    before(async () => {
      await dbMock.collection('users').insertOne(userExample);
      response = await chai.request(app).post('/login').send(userExample);
    });
    it('Deve retornar um objeto', async () =>{
      expect(response).to.be.an('object');
    });
    it('Deve retornar status 200', async () =>{
      expect(response).to.have.status(200);
    });
    it('Deve retornar um token', async () =>{
      expect(response.body).to.have.property('token');
    });
  })
});

describe('Testa rota de USERS', () => {
  const userExample1 = { name: 'rogerin', email: 'reogerin@rogerin.com', password: 123, role: 'user'};
  const LoginUserExample1 = { email: 'reogerin@rogerin.com', password: 123};
  const userExample2 = { name: 'minimim', email: 'minimim@minimim.com', password: 123, role: 'user'};
  const LoginUserExample2 = { email: 'minimin@minimin.com', password: 123};
  const adminExample = { name: 'root', email: 'root@root.com', password: 123, role: 'admin'};
  const adminLoginExample = { email: 'root@root.com', password: 123 };
  let dbMock; 

  before(async () => {
    dbMock = await getConnectionMock();
    await dbMock.collection('users').insertOne(userExample1)
    sinon.stub(mongoConnection, 'getConnection').resolves(dbMock);
  });

  after(() => {
    mongoConnection.getConnection.restore();
  });

  describe('Ao criar um novo usuário', () => {
    
    describe('Quando é passado algum dado inválido', () => {
      let response;
      before(async () => {
        response = await chai.request(app).post('/users').send({});
      })
      it('Deve retornar status 400', async () => {
        expect(response).to.have.status(400);
      });
      it('Deve retornar um objeto', () => {
        expect(response.body).be.an('object');
      });
      it('Deve retornar a mensagem "Invalid entries. Try again."', () => {
        expect(response.body.message).to.eql('Invalid entries. Try again.');
      });
    });

    describe('Quando o usuário já existe', () => {
      let response;
      before(async () => {
        response = await chai.request(app).post('/users').send(userExample1);
      });
      it('Deve retornar status 409', async () => {
        expect(response).to.have.status(409);
      });
      it('Deve retornar um objeto', () => {
        expect(response.body).be.an('object');
      });
      it('Deve retornar a mensagem "Email already registered"', () => {
        expect(response.body.message).to.eql('Email already registered');
      });
    });

    describe('Quando usuário é criado com sucesso', () => {
      let response;
      const validUserExample = {
        name: 'Ace Ventura', email: 'detetiva@deanimais.com', password: 'andararmadojamais' 
      };

      before(async () => {
        response = await chai.request(app).post('/users').send(validUserExample);
      })
      it('Deve retornar status 201', async () => {
        expect(response).to.have.status(201);
      });
      it('Deve retornar um objeto', () => {
        expect(response.body).be.an('object');
      });
      it('Deve retornar a mensagem nome, email, role, id', () => {
        expect(response.body.user).to.include.all.keys('name', 'email', 'role', '_id');
      });
    })
    describe('Quando um usuário sem permissão tenta cadastrar um admin', () => {
      let response;
      let token;

      before(async () => {
        await dbMock.collection('users').drop();
        await dbMock.collection('users').insertOne(userExample1)
        const loggedUser = await chai.request(app).post('/login').send(LoginUserExample1);
        token = loggedUser.body.token;
        response = await chai.request(app).post('/users/admin').send(userExample2).set('authorization', token);
      })
      it('Deve retornar status 403', async () => {
        expect(response).to.have.status(403);
      });
      it('Deve retornar um objeto', () => {
        expect(response.body).to.be.an('object');
      });
      it('Deve retornar a mensagem "Only admins can register new admins"', () => {
        expect(response.body.message).to.eql('Only admins can register new admins');
      });
    })
    describe('Quando um admin cadastra outro admin', () => {
      let response;
      let token;

      before(async () => {
        await dbMock.collection('users').drop();
        await dbMock.collection('users').insertOne(adminExample)
        const loggedUser = await chai.request(app).post('/login').send(adminLoginExample);
        token = loggedUser.body.token;
        response = await chai.request(app).post('/users/admin').send(userExample1).set('authorization', token);
      })
      it('Deve retornar status 201', async () => {
        expect(response).to.have.status(201);
      });
      it('Deve retornar um objeto', () => {
        expect(response.body.user).to.be.an('object');
      });
      it('Deve retornar um objeto', () => {
        expect(response.body.user).to.include.all.keys('name', 'email', 'role', '_id');
      });
    })
  })
});

describe('testa rota de RECEITAS', () => {
  let dbMock;
  let token;
  const recipeExample = {name: 'Macarrão ao alho é ódio', ingredients: 'macarrão', preparation: 'Como se faz esse macarrao'};
  const userExample = { name: 'rogerin', email: 'reogerin@rogerin.com', password: 123};
  const userLoginExample = { email: 'reogerin@rogerin.com', password: 123 };

  before(async () => {
    dbMock = await getConnectionMock();
    sinon.stub(mongoConnection, 'getConnection').resolves(dbMock);
    await dbMock.collection('users').insertOne(userExample);
    const loggedUser = await chai.request(app).post('/login').send(userLoginExample);
    token = loggedUser.body.token
  });

  after(() => {
    mongoConnection.getConnection.restore();
  });
  describe('Ao criar uma nova receita', () => {
    describe('Quando não é passado o token', () => {
      let response;

      before(async () => {
        response = await chai.request(app).post('/recipes').send(recipeExample).set('authorization', '');
      })
      it('Deve retornar status 401', () => {
        expect(response).to.have.status(401);
      });
      it('Deve retornar a mensagem "missing auth token"', () => {
        expect(response.body.message).to.eql('missing auth token')
      })
    });

    describe('Quando é passado algum token inválido', () => {
      let response;
      before(async () => {
        response = await chai.request(app).post('/recipes').send(recipeExample).set('authorization', '123');
      });
      it('Deve retornar status 401', () => {
        expect(response).to.have.status(401);
      });
      it('Deve retornar a mensagem "jwt malformed"', () => {
        expect(response.body.message).to.eql('jwt malformed')
      });
    });

    describe('Quando não é passado o nome ou ingrediente ou o modo de preparo ou nenhum dos itens anteriores', () => {
      let response;
      before(async () => {
        response = await chai.request(app).post('/recipes').send({}).set('authorization', token)
      });
      it('Deve retornar status 400', () => {
        expect(response).to.have.status(400);
      });
      it('Deve retornar a mensagem "Invalid entries. Try again."', () => {
        expect(response.body.message).to.eql('Invalid entries. Try again.')
      });
    });

    describe('Quando uma receita é criada com sucesso', () => {
      let response;
      before(async () => {
        response = await chai.request(app).post('/recipes').send(recipeExample).set('authorization', token);
      });
      it('Deve retornar status 201', () => {
        expect(response).to.have.status(201);
      });
      it('Deve retornar a mensagem "Invalid entries. Try again."', () => {
        expect(response.body.recipe).to.include.all.keys('userId', 'name', 'ingredients', 'preparation')
      });
    })
  });

  describe('Ao listar todas as receitas', () => {
    describe('Quando não receitas para serem listadas', () => {
      let response;
      before(async () => {
        await dbMock.collection('recipes').drop();
        response = await chai.request(app).get('/recipes');
      });
      it('Deve retornar status 200', () => {
        expect(response).to.have.status(200);
      });
      it('Deve retornar um array vazio', () => {
        expect(response.body).to.be.empty;
      });

      describe('Quando há receitas cadastradas, deve retornar um array com as receitas', () => {
        let response;
        before(async () => {
          dbMock.collection('recipes').insertOne(recipeExample);
          response = await chai.request(app).get('/recipes');
        });
        it('Deve retornar status 200', () => {
          expect(response).to.have.status(200);
        });
        it('Deve retornar um array com as receitas registradas', () => {
          expect(response).to.not.be.empty;
        })
      });

      describe('Ao buscar uma receita pelo seu ID', () => {
        let response;

        before(async () => {
          response = await chai.request(app).get('/recipes/:id').send('123');
        });
        describe('Quando não encontra a receita', () => {
          it('Deve retornar status 404', () => {
            expect(response).to.have.status(404);
          });
          it('Deve retornar a mensagem "recipe not found"', () => {
            expect(response.body.message).to.eql('recipe not found');
          });
        });

        describe('Quando encontra a receita', () => {
          let response;
          let recipeId;
          let userId;
  
          before(async () => {
            await dbMock.collection('recipes').drop();
            const newRecipe = await dbMock.collection('recipes').insertOne(recipeExample);
            id = newRecipe.insertedId;
            response = await chai.request(app).get(`/recipes/${id}`);
          });
          it('Deve retornar status 200', () => {
            expect(response).to.have.status(200);
          });
          it('Deve retornar objeto com a receita encontrada', () => {
            expect(response.body).to.include.keys('_id', 'name', 'ingredients', 'preparation');
          });
        });
      });
    });
  });

  describe('Ao atualizar uma receita', () => {
    describe('Quando não é passado um token', () => {
      let response;
      before(async () => {
        response = await chai.request(app).put('/recipes/32133');
      });
      it('Deve retornar status 401', () => {
        expect(response).to.have.status(401);
      });
      it('Deve retornar a mensagem missing auth token', () => {
        expect(response.body.message).to.eql('missing auth token');
      });
    });
    
    describe('Quando é passado um token inválido', () => {
      let response;
      before(async () => {
        response = await chai.request(app).put('/recipes/32133').set('authorization', '123');
      });
      it('Deve retornar status 401', () => {
        expect(response).to.have.status(401);
      });
      it('Deve retornar a mensagem "jwt malformed"', () => {
        expect(response.body.message).to.eql('jwt malformed');
      });
    });

    describe('Quando uma receita é atualizada com sucesso', () => {
      let response;
      let recipeId;
      let userId;
      let token;

      before(async () => {
        await dbMock.collection('users').drop();
        await dbMock.collection('recipes').drop();
        const newUser = await dbMock.collection('users').insertOne(userExample);
        const loggedUser = await chai.request(app).post('/login').send(userLoginExample);
        userId = newUser.insertedId;
        token = loggedUser.body.token;
        const newRecipe = await chai.request(app).post('/recipes').send(recipeExample).set('authorization', token);
        recipeId = newRecipe.body.recipe._id;
        response = await chai.request(app).put(`/recipes/${recipeId}`).send({
          name: 'batata frita',
          ingredients:'batata',
          preparation: 'joga no óleo e esquece lá'})
          .set('authorization', token);
      });


      it('Deve retornar status 200', () => {
        expect(response).to.have.status(200);
      });
      it('Deve retornar um objeto com as informações da receita atualizadas', () => {
        expect(response.body.name).eql('batata frita');
        expect(response.body.ingredients).eql('batata');
        expect(response.body.preparation).eql('joga no óleo e esquece lá');
      });
    })
  });

  describe('Ao remover uma receita', () => {
    describe('Quando não é passado um token', () => {
      let response;
      before(async () => {
        response = await chai.request(app).delete('/recipes/32133');
      });
      it('Deve retornar status 401', () => {
        expect(response).to.have.status(401);
      });
      it('Deve retornar a mensagem missing auth token', () => {
        expect(response.body.message).to.eql('missing auth token');
      });
    });
    
    describe('Quando é passado um token inválido', () => {
      let response;
      before(async () => {
        response = await chai.request(app).delete('/recipes/32133').set('authorization', '123');
      });
      it('Deve retornar status 401', () => {
        expect(response).to.have.status(401);
      });
      it('Deve retornar a mensagem "jwt malformed"', () => {
        expect(response.body.message).to.eql('jwt malformed');
      });
    });

    describe('Quando a receita é removida com sucesso', () => {
      let response;
      let token;
      let recipesList;
      let recipeId;
      before(async () => {
        await dbMock.collection('users').drop();
        await dbMock.collection('recipes').drop();
        const newUser = await chai.request(app).post('/users').send(userExample);
        const loggedUser = await chai.request(app).post('/login').send(userLoginExample);
        token = loggedUser.body.token;
        const newRecipe = await chai.request(app).post('/recipes').send(recipeExample).set('authorization', token);
        recipeId = newRecipe.body.recipe._id;
        response = await chai.request(app).delete(`/recipes/${recipeId}`).set('authorization', token);
        recipesList = await chai.request(app).get('/recipes');
      });
      it('Deve retornar status 404', async () => {
        expect(response).to.have.status(204);
      });
      it('A lista de receitas nao deve conter a receita removida', async () => {
        expect(recipesList.body).to.be.empty;
      });
    });
    describe('Quando um usuário comum que não é proprietário tenta remove-la', () => {
      let response;
      let token;
      let recipesList;
      let recipeId;
      before(async () => {
        await dbMock.collection('users').drop();
        await dbMock.collection('recipes').drop();
        await dbMock.collection('users').insertOne(userExample);
        const loggedUser = await chai.request(app).post('/login').send(userLoginExample);
        token = loggedUser.body.token;
        const newRecipe = await dbMock.collection('recipes').insertOne(userExample);
        recipeId = newRecipe.insertedId;
        response = await chai.request(app).delete(`/recipes/${recipeId}`).set('authorization', token);
        recipesList = await chai.request(app).get('/recipes');
      });
      it('Deve retornar status 404', async () => {
        expect(response).to.have.status(204);
      });
      it('A receita não deve ser removida da lista', async () => {
        expect(recipesList.body).to.not.be.empty;
      });
    });
    describe('Quando um admin que não é proprietário tenta remover a receita', () => {
      let response;
      let token;
      let recipesList;
      let recipeId;
      before(async () => {
        await dbMock.collection('users').drop();
        await dbMock.collection('recipes').drop();
        await dbMock.collection('users').insertOne({...userExample, role: 'admin'});
        const loggedUser = await chai.request(app).post('/login').send(userLoginExample);
        token = loggedUser.body.token;
        const newRecipe = await dbMock.collection('recipes').insertOne(userExample);
        recipeId = newRecipe.insertedId;
        response = await chai.request(app).delete(`/recipes/${recipeId}`).set('authorization', token);
        recipesList = await chai.request(app).get('/recipes');
      });
      it('Deve retornar status 404', async () => {
        expect(response).to.have.status(204);
      });
      it('A receita não deve ser removida da lista', async () => {
        expect(recipesList.body).to.be.empty;
      });
    });
    describe('Quando atualiza a url de uma imagem', () => {
      let response;
      before(async () => {
        await dbMock.collection('recipes').drop();
        const newRecipe = await dbMock.collection('recipes').insertOne(recipeExample);
        const recipeId = newRecipe.insertedId;
        response = await chai.request(app).put(`/recipes/${recipeId}/image`).set('authorization', token);
      });
      it('Deve retornar status 200', async () => {
        expect(response).to.have.status(200);
      });
    });
  })
});
