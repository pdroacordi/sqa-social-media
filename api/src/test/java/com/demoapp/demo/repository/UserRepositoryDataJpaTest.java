package com.demoapp.demo.repository;

import static org.junit.jupiter.api.Assertions.assertThrows;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.dao.DataIntegrityViolationException;

import com.demoapp.demo.model.User;

/**
 * Teste extra com @DataJpaTest (H2), fora das 3 categorias obrigatorias do enunciado,
 * mas de alto valor: verifica se a persistencia impede e-mails duplicados no nivel de banco.
 */
@DataJpaTest
class UserRepositoryDataJpaTest {

  @Autowired
  private UserRepository userRepository;

  @Test
  @DisplayName("dado e-mail duplicado, quando salvar dois usuarios, entao deveria falhar por constraint unica (BUG: entidade User nao tem @Column(unique=true) em email)")
  void dadoEmailDuplicado_quandoSalvarDoisUsuarios_entaoDeveriaFalharPorConstraintUnica() {
    User primeiro = new User();
    primeiro.setEmail("duplicado@teste.com");
    primeiro.setPassword("Senha123!");
    userRepository.saveAndFlush(primeiro);

    User segundo = new User();
    segundo.setEmail("duplicado@teste.com");
    segundo.setPassword("OutraSenha123!");

    // A unicidade de e-mail hoje so e checada na camada de servico (findByEmail antes do save),
    // nao no banco. Este teste documenta que a entidade deveria rejeitar o segundo insert.
    assertThrows(DataIntegrityViolationException.class, () -> userRepository.saveAndFlush(segundo),
        "Esperado que o banco rejeitasse e-mail duplicado, mas User nao possui constraint de unicidade na coluna email");
  }
}
