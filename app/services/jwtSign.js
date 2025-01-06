'use strict';

const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const User = require('../models').clients;
const Agency = require('../models').agencies;
const Teller = require('../models').teller_accounts;
const Admin = require('../models').admins;
const Role = require('../models').roles;
const Permission = require('../models').permissions;
const RolePermission = require('../models').role_permissions;

var privateKEY = fs.readFileSync(path.join(__dirname, '../keys/private.key'), {
  encoding: 'utf8',
  flag: 'r'
});
var publicKEY = fs.readFileSync(path.join(__dirname, '../keys/public.key'), {
  encoding: 'utf8',
  flag: 'r'
});
const Timestamp = require('timestamp-nano');

// SIGNING OPTIONS
var authOptions = {
  expiresIn: process.env.JWT_EXPIRES_IN,
  algorithm: process.env.JWT_ALGO
};

/* GET jwt token */
var getToken = async (user) => {
  try {
    const payload = {
      _id: user.id
    };

    let token = await jwt.sign(payload, privateKEY, authOptions);

    if (!token) return { message: 'User Not found.' };
    else return token;
  } catch (err) {
    throw new Error(err.message);
  }
};

const verifySocketToken = async (socket, next) => {
  console.log('verifySocketToken');
  try {
    // Retrieve token from query or Authorization he der
    let token = socket.handshake?.query.token;

    if (!token && socket.handshake.headers['auth']) {
      const authHeader = socket.handshake.headers['auth'];
      if (authHeader.startsWith('Bearer')) {
        token = authHeader.split(' ')[1];
      }
      token = authHeader;
    }

    // If no token is found
    if (!token) {
      console.error('Authentication error: No token provided');
      return next(new Error('Authentication error: No token provided'));
    }
    const decoded = jwt.verify(token, publicKEY, authOptions);
    //nsole.log('decoded', decoded);
    const user = await User.findByPk(decoded._id);
    console.log('user', user);
    if (!user) return next(new Error('User not found'));

    socket.user = user; // Attach user info to the socket object
    console.log('socketuser', socket.user);
    next();
  } catch (error) {
    console.log('error', error);
    next(new Error('Authentication error'));
  }
};

var getEmailToken = async (user) => {
  try {
    const payload = {
      _id: user.id
    };

    let token = await jwt.sign(payload, privateKEY, {
      expiresIn: '1d',
      algorithm: process.env.JWT_ALGO
    });

    if (!token) return { message: 'User Not found.' };
    else return token;
  } catch (err) {
    throw new Error(err.message);
  }
};

const verifyTokenWithoutUser = (req, res, next) => {
  let token;
  const bearerHeader = req.headers['authorization'];

  if (bearerHeader) {
    const bearer = bearerHeader.split(' ');
    const bearerToken = bearer[1];
    token = bearerToken;
  }

  if (!token) {
    return res.status(403).send({
      message: 'No token provided!'
    });
  }

  jwt.verify(token, publicKEY, authOptions, (err) => {
    if (err) {
      return res.status(401).send({
        message: 'Authentication failed!'
      });
    } else {
      next();
    }
  });
};
/* Verify jwt token */
var verifyToken = (req, res, next) => {
  let token;
  const bearerHeader = req.headers['authorization'];

  if (bearerHeader) {
    const bearer = bearerHeader.split(' ');
    const bearerToken = bearer[1];
    token = bearerToken;
  }

  if (!token) {
    return res.status(403).send({
      message: 'No token provided!'
    });
  }

  jwt.verify(token, publicKEY, authOptions, (err, decoded) => {
    if (err) {
      return res.status(401).send({
        message: 'Authentication failed!'
      });
    }

    User.findByPk(decoded._id, {
      attributes: {
        exclude: ['createdAt', 'updatedAt', 'password']
      },
      include: [{ model: Role, required: true }]
    })
      .then((user) => {
        if (user.isSuspend == '1') {
          return res.status(410).send({
            message: 'Your Account Suspended!'
          });
        }
        if (user.isEmailVerified == '0') {
          return res.status(410).send({
            message: 'Your Account is not verified!'
          });
        }
        if (user.isDeleted == '1') {
          return res.status(410).send({
            message: 'Your Account Deleted!'
          });
        }
        req.user = user;
        next();
        return;
      })
      .catch(() => {
        return res.status(401).send({
          message: 'Unauthorized!'
        });
      });
  });
};

var verifyAdmin = (req, res, next) => {
  let token;
  const bearerHeader = req.headers['authorization'];

  if (bearerHeader) {
    const bearer = bearerHeader.split(' ');
    const bearerToken = bearer[1];
    token = bearerToken;
  }

  if (!token) {
    return res.status(403).send({
      message: 'No token provided!'
    });
  }

  jwt.verify(token, publicKEY, authOptions, (err, decoded) => {
    if (err) {
      return res.status(401).send({
        message: 'Authentication failed!'
      });
    }

    Admin.findByPk(decoded._id, { include: [{ model: Role, required: true }] })
      .then((user) => {
        if (![1, 2, 3, 4].includes(user.roleId)) {
          return res.status(410).send({
            message: 'Only admin account can access!'
          });
        }
        if (user.isSuspend == '1') {
          return res.status(410).send({
            message: 'Your Account Suspended!'
          });
        }
        if (user.isDeleted == '1') {
          return res.status(410).send({
            message: 'Your Account Deleted!'
          });
        }
        req.user = user;

        next();
        return;
      })
      .catch(() => {
        return res.status(401).send({
          message: 'Unauthorized!'
        });
      });
  });
};

const removeParamsFromPath = (req) => {
  let path = req.path;

  Object.keys(req.params).forEach((param) => {
    const paramValue = req.params[param];
    path = path.replace(`/${paramValue}`, '/{params}');
  });

  return path.replace(/\/$/, '');
};

// const verifySocketToken = (token) => {
//   jwt.verify(token, publicKEY, authOptions, (err, decoded) => {
//     if (err) {
//       return { error: 'not authorized' };
//     }
//     return decoded;
//   });
// };

const verifyAdminRole = (req, res, next) => {
  const userRoleId = req.user.roleId;

  const path = removeParamsFromPath(req);
  Permission.findOne({
    where: {
      permission: path
    }
  })
    .then((permission) => {
      RolePermission.findOne({
        where: {
          roleId: userRoleId,
          permissionId: permission.id
        }
      })
        .then((rolePermission) => {
          if (rolePermission) {
            next();
          } else {
            return res.status(403).send({
              message: 'You are not authorized to access this resource!'
            });
          }
        })
        .catch(() => {
          return res.status(403).send({
            message: 'You are not authorized to access this resource!'
          });
        });
    })
    .catch(() => {
      return res.status(403).send({
        message: 'You are not authorized to access this resource!'
      });
    });
};

var verifyAgency = (req, res, next) => {
  let token;
  const bearerHeader = req.headers['authorization'];

  if (bearerHeader) {
    const bearer = bearerHeader.split(' ');
    const bearerToken = bearer[1];
    token = bearerToken;
  }

  if (!token) {
    return res.status(403).send({
      message: 'No token provided!'
    });
  }

  jwt.verify(token, publicKEY, authOptions, (err, decoded) => {
    if (err) {
      return res.status(401).send({
        message: 'Authentication failed!'
      });
    }

    Agency.findByPk(decoded._id, { include: [{ model: Role, required: true }] })
      .then((user) => {
        if (user.isSuspend == '1') {
          return res.status(410).send({
            message: 'Your Account Suspended!'
          });
        }
        if (user.isDeleted == '1') {
          return res.status(410).send({
            message: 'Your Account Deleted!'
          });
        }
        if (user.isEmailVerified == '0') {
          return res.status(410).send({
            message: 'Your Account is not verified!'
          });
        }
        req.user = user;
        next();
        return;
      })
      .catch((err) => {
        console.log(err);
        return res.status(401).send({
          message: 'Unauthorized!'
        });
      });
  });
};

const verifyUserAuth = async (req, res, next) => {
  try {
    // Get token from header
    let token;
    const bearerHeader = req.headers['authorization'];

    if (bearerHeader) {
      const bearer = bearerHeader.split(' ');
      token = bearer[1];
    }

    if (!token) {
      return res.status(403).send({
        message: 'No token provided!'
      });
    }

    // Verify token
    const decoded = await jwt.verify(token, publicKEY, authOptions);

    // Try to find user in both tables
    let user = await User.findByPk(decoded._id, {
      attributes: {
        exclude: ['createdAt', 'updatedAt', 'password']
      },
      include: [{ model: Role, required: true }]
    });

    let isAgency = false;

    // If not found in User table, check Agency table
    if (!user) {
      user = await Agency.findByPk(decoded._id, {
        include: [{ model: Role, required: true }]
      });
      isAgency = true;
    }

    // If user not found in either table
    if (!user) {
      return res.status(401).send({
        message: 'Unauthorized!'
      });
    }

    // Check account status
    if (user.isSuspend === '1') {
      return res.status(410).send({
        message: 'Your Account Suspended!'
      });
    }

    if (user.isDeleted === '1') {
      return res.status(410).send({
        message: 'Your Account Deleted!'
      });
    }

    if (user.isEmailVerified === '0') {
      return res.status(410).send({
        message: 'Your Account is not verified!'
      });
    }

    // Add user and type to request object
    req.user = user;
    req.isAgency = isAgency;

    next();
  } catch (err) {
    console.error('Auth Middleware Error:', err);
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).send({
        message: 'Authentication failed!'
      });
    }
    return res.status(401).send({
      message: 'Unauthorized!'
    });
  }
};
var verifyTeller = (req, res, next) => {
  let token;
  const bearerHeader = req.headers['authorization'];

  if (bearerHeader) {
    const bearer = bearerHeader.split(' ');
    const bearerToken = bearer[1];
    token = bearerToken;
  }

  if (!token) {
    return res.status(403).send({
      message: 'No token provided!'
    });
  }

  jwt.verify(token, publicKEY, authOptions, (err, decoded) => {
    if (err) {
      return res.status(401).send({
        message: 'Authentication failed!'
      });
    }

    Teller.findByPk(decoded._id, { include: [{ model: Role, required: true }] })
      .then((user) => {
        if (user.isSuspend == '1') {
          return res.status(410).send({
            message: 'Your Account Suspended!'
          });
        }
        if (user.isDeleted == '1') {
          return res.status(410).send({
            message: 'Your Account Deleted!'
          });
        }
        if (user.isEmailVerified == '0') {
          return res.status(410).send({
            message: 'Your Account is not verified!'
          });
        }
        req.user = user;
        next();
        return;
      })
      .catch((err) => {
        console.log(err);
        return res.status(401).send({
          message: 'Unauthorized!'
        });
      });
  });
};

var verifyEmailToken = async (token) => {
  try {
    var decoded = await jwt.verify(token, publicKEY, authOptions);
    return decoded;
  } catch (err) {
    return err;
  }
};

/* GET jwt small size token */
var getInviteToken = async (user) => {
  try {
    const payload = {
      _id: user.id
    };

    let token = await jwt.sign(payload, 'secret', { expiresIn: '30d' });
    console.log(token);

    if (!token) {
      return { message: 'User Not found.' };
    } else {
      return token;
    }
  } catch (err) {
    throw new Error(err.message);
  }
};

//Get New Invitation Token
var getNewInviteToken = async () => {
  try {
    let dateTime = Timestamp.fromDate(new Date()).toJSON();

    let nanoNum = Timestamp.fromString(dateTime).getTimeT();

    let nano = nanoNum.toString();

    let nano1 = nano.slice(0, 5);

    let nano2 = nano.slice(5, 10);

    let random4Digit = Math.floor(Math.random() * (10000 - 1000) + 1000);

    let randomString = random4Digit.toString();

    let token = nano1 + randomString + nano2;

    if (!token) {
      return { message: 'Error creating token' };
    } else {
      return token;
    }
  } catch (err) {
    throw new Error(err.message);
  }
};

module.exports = {
  getToken,
  verifyUserAuth,
  verifyToken,
  verifyAdmin,
  verifyEmailToken,
  getInviteToken,
  getNewInviteToken,
  getEmailToken,
  verifyTokenWithoutUser,
  verifyAgency,
  verifyAdminRole,
  verifySocketToken
};
