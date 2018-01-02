//Tables
var router = express.Router();
var Language = models.language;
var LanguageInCountry = models.tbllanguageincountry;

//End of Tables
//----------------------mobileapp:-Cahnge app language-------------------------
router.get('/GetAllPublishLanguage', function(req, res) {
    Language.hasMany(LanguageInCountry, {
        foreignKey: {
            name: 'IdLanguage',
            allowNull: false
        }
    });
    Language.findAll({
        where: { Published: true },
        include: [{
            model: LanguageInCountry,
            where: {
                $or: [{ Country: req.query.Country }, { Country: 'All' }]
            }
        }],
        order: ['DisplayOrder']
    }).then(function(response) {
        res.json(response);
    }).catch(function(error) {
        res.json(error);
    })
})


module.exports = router