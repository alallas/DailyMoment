## http和https的对比



## https
### https的基本实现过程

1. 客户端问候（ClientHello）：客户端发送一个明文消息到服务器，包含客户端支持的 TLS 版本、加密算法、压缩方法和随机数。

2. 服务器问候（ServerHello）：服务器响应一个明文消息，包含服务器选择的 TLS 版本、加密算法、压缩方法和随机数，以及服务器的证书。

3. 证书验证：客户端验证服务器的证书，确保服务器的身份是合法的。如果证书验证失败，客户端会终止连接。

4. 密钥交换：客户端和服务器使用密钥交换算法安全地交换会话密钥。

5. 加密通信：一旦会话密钥被交换，双方就可以使用对称加密算法来加密和解密数据。








