var nodemailer = require('nodemailer');

module.exports = {
    sendmail: function (req, res) {
        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'fslio.startup@gmail.com',
                pass: 'fslio@abc123'
            }
        });

        var mailOptions = {
            from: '"FSL-IO 👻" <fslio.startup@bgmail.com>', // sender address
            to: 'thanhan2014.nguyen@gmail.com', // list of receivers
            subject: 'Hello ✔ Test verify email singin by FSL-IO', // Subject line
            text: 'Click the following link to confirm your account:', // plain text body
            html: '<a href="hcmutefslio.herokuapp.com">Click to verify acount!</a>' // html body
        };
        transporter.sendMail(mailOptions, function (err, info) {
            if (err) throw err;
            console.log('Message %s sent: %s', info.messageId, info.response);
        });

        return res.status(200).json({
            message: 'Send email success!'
        });
    }

}
