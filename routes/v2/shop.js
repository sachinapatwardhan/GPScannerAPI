const moment = require('moment');

const router = express.Router();
const shopFn = require('../../functions/shop.js');
const pool = require('../../connection/pool.js');

router.get('/getShopLink', (req, res) => {
  const auth = req.header('authorization');

  if (!auth) {
    return res.json({
      success: false,
      message: 'No permission to go to shop.'
    });
  }

  const token = auth.split(' ')[1];

  if (!token) {
    return res.json({
      success: false,
      message: 'No permission to go to news.'
    });
  }

  let decoded = null;
  try {
    decoded = jwt.decode(token, process.env.TokenKey);
  } catch (err) {
    return res.json({
      success: false,
      message: 'No permission to go to news.'
    });
  }

  const userQuery = 'SELECT id FROM tbluserinformation WHERE username = ? AND idApp = ? ORDER BY id ASC LIMIT 1';
  const userBindings = [decoded.username, req.query.appId];

  return pool.query(userQuery, userBindings, (err, rows) => {
    if (err) {
      console.error('[%s]', moment.utc().format('YYYY-MM-DD HH:mm:ss.SSS'), err.stack || err.message || err);

      return res.json({
        success: false,
        message: 'Unable to get link. Please try again.'
      });
    }

    const [user] = rows;

    if (!user) {
      return res.json({
        success: false,
        message: 'User not found.'
      });
    }

    const toBeEncrypt = auth + '||' + user.id + '||' + req.query.appId + '||' + moment().toISOString();

    console.log('[SHOP]', toBeEncrypt);

    const encrypted = shopFn.encrypt(toBeEncrypt);

    return res.json({
      success: true,
      message: 'Link generated.',
      data: {
        link: 'https://webappreport.maark.my/webapplogin/?token=' + encodeURIComponent(encrypted)
      }
    });
  });
});

module.exports = router;
