const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();
// import { Table, Column, Model, HasMany } from 'sequelize-typescript';
// const { DB_HOST } = process.env;
// Create sequelize connection to mysql database
const sequelize = new Sequelize({
  host: '127.0.0.1',
  dialect: 'mysql',
  username: 'root',
  password: '',
  database: 'theSpot',
  logging: false
});

const Users = sequelize.define(
  'Users',
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    username: {
      type: DataTypes.STRING(100),
      unique: true,
    },
    displayName: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING(100),
    },
    geolocation: {
      type: DataTypes.STRING(100),
    },
    mapIcon: DataTypes.STRING(100),
    birthday: DataTypes.DATE,
    privacy: DataTypes.STRING(100),
    accessibility: DataTypes.STRING(100),
    email: DataTypes.STRING(100),
    picture: DataTypes.STRING(100),
    googleId: DataTypes.STRING(100),
  },
  { timestamps: true }
);

const Places = sequelize.define(
  'Places',
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    venue_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    coordinates: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
  },
  { timestamps: true }
);

const Events = sequelize.define(
  'Events',
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    rsvp_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    date: {
      type: DataTypes.STRING(100),
    },
    time: {
      type: DataTypes.STRING(100),
    },
    endTime: {
      type: DataTypes.STRING(100),
    },
    geolocation: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    address: {
      type: DataTypes.STRING(100)
    },
    twenty_one: {
      type: DataTypes.BOOLEAN,
    },
    isPublic: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
  },
  { timestamps: true }
);

const Reels = sequelize.define(
  'Reels',
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },

    public_id: {
      type: DataTypes.STRING,
    },
    url: {
      type: DataTypes.STRING,
    },
    text: {
      type: DataTypes.STRING(100),
    },
    like_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
  },
  { timestamps: true }
);

const RSVPs = sequelize.define(
  'Rsvp',
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
  },
  { timestamps: true }
);

const Likes = sequelize.define(
  'Likes',
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    checked: {
      type: DataTypes.BOOLEAN
    }
  },
  { timestamps: true }
);

const Notifications = sequelize.define(
  'Notifications',
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    type: {
      type: DataTypes.STRING(100),
    },
    sender_id: {
      type: DataTypes.STRING(100),
    },
    receiver_id: {
      type: DataTypes.STRING(100),
    },
  },
  { timestamps: true }
);

const Friendships = sequelize.define(
  'Friendships',
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    status: {
      type: DataTypes.STRING(100),
    },
    requester_id: {
      type: DataTypes.INTEGER,
      references: {
        model: Users,
        key: 'id',
      },
    },
    accepter_id: {
      type: DataTypes.INTEGER,
      references: {
        model: Users,
        key: 'id',
      },
    },
  },
  { timestamps: true }
);

const Followers = sequelize.define(
  'Followers',
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    status: {
      type: DataTypes.STRING(100),
    },
    follower_id: {
      type: DataTypes.INTEGER,
      references: {
        model: Users,
        key: 'id',
      },
    },
    followedUser_id: {
      type: DataTypes.INTEGER,
      references: {
        model: Users,
        key: 'id',
      },
    },
  },
  { timestamps: true }
);

// FOREIGN Keys UserId AND EventId to Reels
Users.hasMany(Reels, {
  onDelete: 'CASCADE'
});
Reels.belongsTo(Users);
Events.hasMany(Reels, {
  onDelete: 'CASCADE'
});
Reels.belongsTo(Events);

// FOREIGN Keys PlaceId AND UserId to Events
Places.hasMany(Events, {
  onDelete: 'CASCADE'
});
Events.belongsTo(Places);
Users.hasMany(Events, {
  onDelete: 'CASCADE'
});
Events.belongsTo(Users);

// FOREIGN Keys ReelId AND UserId to Likes
Reels.hasMany(Likes, {
  onDelete: 'CASCADE'
});
Likes.belongsTo(Reels);
Users.hasMany(Likes, {
  onDelete: 'CASCADE'
});
Likes.belongsTo(Users);

// FOREIGN Keys UserId AND EventId to RSVPs
Users.hasMany(RSVPs, {
  onDelete: 'CASCADE'
});
RSVPs.belongsTo(Users);
Events.hasMany(RSVPs, {
  onDelete: 'CASCADE'
});
RSVPs.belongsTo(Events);
// Users.belongsToMany(Events, {through: RSVPs})
// Events.belongsToMany(Users, {through: RSVPs})

module.exports = {
  db: sequelize,
  Users,
  Places,
  Events,
  Reels,
  RSVPs,
  Likes,
  Notifications,
  Friendships,
  Followers
};
