/**
 * 这是针对sw等引入策略处理
 * 处理 注册／ 更新
 * 针对sw等开关处理，针对sw 做卸载处理
 * 
 */

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