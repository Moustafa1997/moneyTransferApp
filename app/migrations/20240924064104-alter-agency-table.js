'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableDesc = await queryInterface.describeTable('agencies');

    if (tableDesc.first_name && !tableDesc.representative_first_name) {
      await queryInterface.renameColumn('agencies', 'first_name', 'representative_first_name');
    }

    if (tableDesc.last_name && !tableDesc.representative_last_name) {
      await queryInterface.renameColumn('agencies', 'last_name', 'representative_last_name');
    }

    if (tableDesc.gender && !tableDesc.representative_gender) {
      await queryInterface.renameColumn('agencies', 'gender', 'representative_gender');
    }

    if (tableDesc.birth_date && !tableDesc.representative_birth_date) {
      await queryInterface.renameColumn('agencies', 'birth_date', 'representative_birth_date');
    }

    if (!tableDesc.name) {
      await queryInterface.addColumn('agencies', 'name', {
        type: Sequelize.STRING(25),
        allowNull: false
      });
    }

    await queryInterface.changeColumn('agencies', 'phone', {
      type: Sequelize.STRING(255),
      allowNull: false
    });

    await queryInterface.changeColumn('agencies', 'cash_capacity', {
      type: Sequelize.INTEGER,
      allowNull: false
    });

    await queryInterface.changeColumn('agencies', 'recharge_budget', {
      type: Sequelize.INTEGER,
      allowNull: false
    });

    await queryInterface.changeColumn('agencies', 'cashiers', {
      type: Sequelize.INTEGER,
      allowNull: false
    });

    await queryInterface.changeColumn('agencies', 'representative_first_name', {
      type: Sequelize.STRING(255),
      allowNull: false
    });

    await queryInterface.changeColumn('agencies', 'representative_last_name', {
      type: Sequelize.STRING(255),
      allowNull: false
    });

    await queryInterface.changeColumn('agencies', 'representative_phone', {
      type: Sequelize.STRING(255),
      allowNull: false
    });

    await queryInterface.changeColumn('agencies', 'representative_email', {
      type: Sequelize.STRING(255),
      allowNull: false
    });

    await queryInterface.changeColumn('agencies', 'representative_id_number', {
      type: Sequelize.STRING(255),
      allowNull: false
    });

    if (!tableDesc.uploaded_signature) {
      await queryInterface.addColumn('agencies', 'uploaded_signature', {
        type: Sequelize.STRING(255),
        allowNull: true
      });
    }

    if (tableDesc.company_registration_document) {
      await queryInterface.removeColumn('agencies', 'company_registration_document');
    }

    if (tableDesc.representative_profile) {
      await queryInterface.removeColumn('agencies', 'representative_profile');
    }
  },

  down: async (queryInterface, Sequelize) => {
    const tableDesc = await queryInterface.describeTable('agencies');

    if (tableDesc.representative_first_name && !tableDesc.first_name) {
      await queryInterface.renameColumn('agencies', 'representative_first_name', 'first_name');
    }

    if (tableDesc.representative_last_name && !tableDesc.last_name) {
      await queryInterface.renameColumn('agencies', 'representative_last_name', 'last_name');
    }

    if (tableDesc.representative_gender && !tableDesc.gender) {
      await queryInterface.renameColumn('agencies', 'representative_gender', 'gender');
    }

    if (tableDesc.representative_birth_date && !tableDesc.birth_date) {
      await queryInterface.renameColumn('agencies', 'representative_birth_date', 'birth_date');
    }

    if (tableDesc.name) {
      await queryInterface.removeColumn('agencies', 'name');
    }

    if (tableDesc.uploaded_signature) {
      await queryInterface.removeColumn('agencies', 'uploaded_signature');
    }

    await queryInterface.addColumn('agencies', 'company_registration_document', {
      type: Sequelize.TEXT,
      allowNull: true
    });

    await queryInterface.addColumn('agencies', 'representative_profile', {
      type: Sequelize.TEXT,
      allowNull: true
    });
  }
};
