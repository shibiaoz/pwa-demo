/**
 * 这是针对sw等引入策略处理
 * 处理 注册／ 更新
 * 针对sw等开关处理，针对sw 做卸载处理
 * 
 */

var endpoint;
var key;
var authSecret;

function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

function determineAppServerKey() {
    var vapidPublicKey = 'BAyb_WgaR0L0pODaR7wWkxJi__tWbM1MPBymyRDFEGjtDCWeRYS9EF7yGoCHLdHJi6hikYdg4MuYaK0XoD0qnoY';
    return urlBase64ToUint8Array(vapidPublicKey);
}

function confirmPush(registration) {
    return registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: determineAppServerKey()
        })
        .then(function (subscription) {

            var rawKey = subscription.getKey ? subscription.getKey('p256dh') : '';
            key = rawKey ? btoa(String.fromCharCode.apply(null, new Uint8Array(rawKey))) : '';
            var rawAuthSecret = subscription.getKey ? subscription.getKey('auth') : '';
            authSecret = rawAuthSecret ?
                btoa(String.fromCharCode.apply(null, new Uint8Array(rawAuthSecret))) : '';

            endpoint = subscription.endpoint;

            return fetch('http://localhost:3000/register', {
                method: 'post',
                headers: new Headers({
                    'content-type': 'application/json'
                }),
                body: JSON.stringify({
                    endpoint: subscription.endpoint,
                    key: key,
                    authSecret: authSecret,
                }),
            })

        });
}

var __sw_flag = true; // __sw_flag 应该来源于网路配置
if ('serviceWorker' in navigator) {
    if (__sw_flag) {
        navigator.serviceWorker.register('/my-service.js').then(function (registration) {
            registration.addEventListener("updatefound", () => {
                var newWorker = registration.installing;
                newWorker.addEventListener("statechange", () => {
                    // newWorker 状态发生变化
                    var state = newWorker.state; // 
                    console.log('statechange', newWorker.state);
                    if (state === 'activated') {
                        // 如果sw 更新来，是否要刷新页面
                        window.location.reload();
                    }
                });
            });

            return registration.pushManager.getSubscription()
                .then(function (subscription) {

                    if (subscription) {
                        // We already have a subscription, let's not add them again
                        return;
                    }

                    return confirmPush(registration);
                });
            // 注册成功
            console.log('注册成功', registration.scope);
        }).catch(function (err) {
            // 注册失败
            console.log('注册失败 registration failed: ', err);
        });
    } else {
        navigator.serviceWorker.getRegistration('/my-service.js').then(function (registration) {
            if (registration && registration.unregister) {
                registration.unregister().then(function (isUnRegistered) {
                    if (isUnRegistered) {
                        console.log('[SW]: UnRegistration  succeeded.');
                        window.location.reload();
                    } else {
                        console.log('[SW]: UnRegistration failed.');
                    }
                });
            }
        }).catch(function (error) {
            console.log('[SW]: UnRegistration failed with. ' + error);
        });
    }

} else {
    console.log('not support serviceWorker')
}