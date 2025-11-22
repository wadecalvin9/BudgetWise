const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

const withGradleWrapperTimeout = (config) => {
    return withDangerousMod(config, [
        'android',
        async (config) => {
            const file = path.join(config.modRequest.platformProjectRoot, 'gradle', 'wrapper', 'gradle-wrapper.properties');

            if (fs.existsSync(file)) {
                let contents = fs.readFileSync(file, 'utf8');
                if (!contents.includes('networkTimeout')) {
                    contents += '\nnetworkTimeout=120000\n';
                    fs.writeFileSync(file, contents);
                } else if (contents.includes('networkTimeout=10000')) {
                    contents = contents.replace('networkTimeout=10000', 'networkTimeout=120000');
                    fs.writeFileSync(file, contents);
                }
            }
            return config;
        },
    ]);
};

module.exports = withGradleWrapperTimeout;
