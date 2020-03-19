const { User, Appointment } = require("../models");
const moment = require("moment");
const { Op } = require("sequelize");

class DashboardController {
  async index(req, res) {
    const date = moment();
    const providers = await User.findAll({ where: { provider: true } });
    const users = await User.findAll();
    const schedule = await Appointment.findAll({
      where: {
        provider_id: req.session.user.id,
        date: {
          [Op.between]: [
            date.startOf("day").format(),
            date.endOf("day").format()
          ]
        }
      }
    });

    const appointments = schedule
      .sort(function(a, b) {
        return new Date(a.date) - new Date(b.date);
      })
      .map(m => {
        return {
          user: users.find(f => f.id === m.user_id),
          date: moment(m.date).format("HH:mm"),
          available: moment(m.date).isAfter(moment())
        };
      });

    return res.render("dashboard", { providers, appointments });
  }
}

module.exports = new DashboardController();
